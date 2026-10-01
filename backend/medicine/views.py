from datetime import datetime, timedelta

from django.contrib.auth.models import User
from django.utils import timezone

from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Medicine, MedicineSchedule, DoseRecord
from .serializers import (
    MedicineSerializer,
    MedicineScheduleSerializer,
    DoseRecordSerializer,
)

from accounts.models import CaregiverConnection, Notification


def create_caregiver_notification(dose, notification_type):
    """
    Send an in-app notification to connected caregivers.
    """

    patient = dose.schedule.medicine.user
    medicine = dose.schedule.medicine

    connections = CaregiverConnection.objects.filter(
        patient=patient,
        status="accepted"
    )

    if notification_type == "dose_taken":
        message = (
            f"{patient.username} took "
            f"{medicine.name} ({medicine.dosage})."
        )
    else:
        message = (
            f"{patient.username} missed "
            f"{medicine.name} ({medicine.dosage})."
        )

    for connection in connections:

        # Prevent duplicate notification
        already_exists = Notification.objects.filter(
            recipient=connection.caregiver,
            dose=dose,
            notification_type=notification_type,
        ).exists()

        if not already_exists:
            Notification.objects.create(
                recipient=connection.caregiver,
                patient=patient,
                dose=dose,
                notification_type=notification_type,
                message=message,
            )


def generate_today_doses(user):
    """
    Create today's DoseRecord objects from active schedules.
    Existing dose records are not duplicated.
    """

    now = timezone.now()
    today = timezone.localdate()

    medicines = Medicine.objects.filter(
        user=user,
        is_active=True,
        start_date__lte=today,
    )

    created_count = 0

    for medicine in medicines:

        if medicine.end_date and medicine.end_date < today:
            continue

        schedules = MedicineSchedule.objects.filter(
            medicine=medicine,
            is_active=True,
        )

        for schedule in schedules:

            scheduled_at = timezone.make_aware(
                datetime.combine(
                    today,
                    schedule.time
                )
            )

            exists = DoseRecord.objects.filter(
                schedule=schedule,
                scheduled_at=scheduled_at,
            ).exists()

            if not exists:

                DoseRecord.objects.create(
                    schedule=schedule,
                    scheduled_at=scheduled_at,
                    status="pending",
                )

                created_count += 1

    return created_count


def mark_missed_doses(user):
    """
    Mark doses as missed after a 1-hour grace period.
    """

    now = timezone.now()

    cutoff = now - timedelta(hours=1)

    doses = DoseRecord.objects.filter(
        schedule__medicine__user=user,
        status="pending",
        scheduled_at__lt=cutoff,
    ).select_related(
        "schedule",
        "schedule__medicine",
    )

    count = 0

    for dose in doses:

        dose.status = "missed"
        dose.save(update_fields=["status"])

        create_caregiver_notification(
            dose,
            "dose_missed"
        )

        count += 1

    return count


class MedicineViewSet(viewsets.ModelViewSet):

    serializer_class = MedicineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Medicine.objects.filter(
            user=self.request.user
        ).prefetch_related("schedules")

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )


class MedicineScheduleViewSet(viewsets.ModelViewSet):

    serializer_class = MedicineScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return MedicineSchedule.objects.filter(
            medicine__user=self.request.user
        )

    def perform_create(self, serializer):

        medicine_id = self.request.data.get("medicine")

        try:

            medicine = Medicine.objects.get(
                id=medicine_id,
                user=self.request.user
            )

        except Medicine.DoesNotExist:

            raise serializers.ValidationError(
                "Medicine does not belong to this user."
            )

        serializer.save(
            medicine=medicine
        )


class DoseRecordViewSet(viewsets.ModelViewSet):

    serializer_class = DoseRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return DoseRecord.objects.filter(
            schedule__medicine__user=self.request.user
        ).select_related(
            "schedule",
            "schedule__medicine",
        ).order_by(
            "-scheduled_at"
        )

    def list(self, request, *args, **kwargs):

        # Generate today's doses whenever history is opened.
        generate_today_doses(
            request.user
        )

        # Automatically update overdue doses.
        mark_missed_doses(
            request.user
        )

        return super().list(
            request,
            *args,
            **kwargs
        )

    @action(
        detail=False,
        methods=["post"]
    )
    def generate_today(self, request):

        created = generate_today_doses(
            request.user
        )

        mark_missed_doses(
            request.user
        )

        return Response({
            "message": "Today's doses generated.",
            "created": created,
        })

    @action(
        detail=True,
        methods=["post"]
    )
    def take(self, request, pk=None):

        dose = self.get_object()

        if dose.status == "taken":

            return Response(
                {
                    "message":
                    "This dose has already been taken."
                }
            )

        if dose.status == "missed":

            return Response(
                {
                    "message":
                    "This dose was already marked as missed."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        dose.status = "taken"
        dose.confirmed_at = timezone.now()

        dose.save(
            update_fields=[
                "status",
                "confirmed_at",
            ]
        )

        create_caregiver_notification(
            dose,
            "dose_taken"
        )

        return Response(
            DoseRecordSerializer(dose).data
        )

    @action(
        detail=True,
        methods=["post"]
    )
    def skip(self, request, pk=None):

        dose = self.get_object()

        if dose.status in ["taken", "skipped"]:

            return Response(
                {
                    "message":
                    "This dose has already been updated."
                }
            )

        dose.status = "skipped"
        dose.confirmed_at = timezone.now()

        dose.save(
            update_fields=[
                "status",
                "confirmed_at",
            ]
        )

        create_caregiver_notification(
            dose,
            "dose_missed"
        )

        return Response(
            DoseRecordSerializer(dose).data
        )