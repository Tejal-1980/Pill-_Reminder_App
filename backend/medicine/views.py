from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Medicine, MedicineSchedule, DoseRecord
from .serializers import (
    MedicineSerializer,
    MedicineScheduleSerializer,
    DoseRecordSerializer,
)


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

        medicine = Medicine.objects.filter(
            id=medicine_id,
            user=self.request.user
        ).first()

        if not medicine:
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                {"medicine": "Invalid medicine."}
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
            "schedule__medicine"
        )

    @action(
        detail=True,
        methods=["post"]
    )
    def take(self, request, pk=None):
        dose = self.get_object()

        dose.status = "taken"
        dose.confirmed_at = timezone.now()
        dose.save()

        return Response(
            DoseRecordSerializer(dose).data
        )

    @action(
        detail=True,
        methods=["post"]
    )
    def skip(self, request, pk=None):
        dose = self.get_object()

        dose.status = "skipped"
        dose.confirmed_at = timezone.now()
        dose.save()

        return Response(
            DoseRecordSerializer(dose).data
        )