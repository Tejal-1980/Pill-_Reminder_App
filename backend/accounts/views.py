from django.contrib.auth.models import User

from rest_framework import (
    generics,
    status,
    viewsets,
)

from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    UserProfile,
    CaregiverConnection,
    Notification,
)

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CaregiverConnectionSerializer,
    NotificationSerializer,
)


class RegisterView(
    generics.CreateAPIView
):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer


class MeView(
    generics.RetrieveAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = UserSerializer

    def get_object(self):

        return self.request.user


class CaregiverViewSet(
    viewsets.ViewSet
):

    permission_classes = [
        IsAuthenticated
    ]

    @action(
        detail=False,
        methods=["post"],
    )
    def request_connection(
        self,
        request,
    ):

        caregiver_username = request.data.get(
            "caregiver_username"
        )

        if not caregiver_username:

            return Response(
                {
                    "error":
                    "Caregiver username is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            caregiver = User.objects.get(
                username=caregiver_username
            )

        except User.DoesNotExist:

            return Response(
                {
                    "error":
                    "Caregiver not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if caregiver == request.user:

            return Response(
                {
                    "error":
                    "You cannot connect with yourself."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            if caregiver.profile.role != "caregiver":

                return Response(
                    {
                        "error":
                        "This user is not a caregiver."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except UserProfile.DoesNotExist:

            return Response(
                {
                    "error":
                    "Caregiver profile not found."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        connection, created = (
            CaregiverConnection.objects.get_or_create(
                patient=request.user,
                caregiver=caregiver,
                defaults={
                    "status": "pending"
                },
            )
        )

        if not created:

            if connection.status == "accepted":

                return Response(
                    {
                        "error":
                        "Already connected."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            connection.status = "pending"
            connection.save()

        Notification.objects.create(
            recipient=caregiver,
            patient=request.user,
            notification_type="caregiver_request",
            message=(
                f"{request.user.username} sent "
                f"a caregiver connection request."
            ),
        )

        return Response(
            CaregiverConnectionSerializer(
                connection
            ).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["get"],
    )
    def connections(
        self,
        request,
    ):

        connections = (
            CaregiverConnection.objects.filter(
                patient=request.user
            )
            |
            CaregiverConnection.objects.filter(
                caregiver=request.user
            )
        )

        serializer = (
            CaregiverConnectionSerializer(
                connections.distinct(),
                many=True,
            )
        )

        return Response(
            serializer.data
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def accept(
        self,
        request,
        pk=None,
    ):

        try:

            connection = (
                CaregiverConnection.objects.get(
                    id=pk,
                    caregiver=request.user,
                )
            )

        except CaregiverConnection.DoesNotExist:

            return Response(
                {
                    "error":
                    "Connection not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        connection.status = "accepted"
        connection.save()

        return Response(
            CaregiverConnectionSerializer(
                connection
            ).data
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def reject(
        self,
        request,
        pk=None,
    ):

        try:

            connection = (
                CaregiverConnection.objects.get(
                    id=pk,
                    caregiver=request.user,
                )
            )

        except CaregiverConnection.DoesNotExist:

            return Response(
                {
                    "error":
                    "Connection not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        connection.status = "rejected"
        connection.save()

        return Response(
            CaregiverConnectionSerializer(
                connection
            ).data
        )

    @action(
        detail=False,
        methods=["get"],
    )
    def patients(
        self,
        request,
    ):

        connections = (
            CaregiverConnection.objects.filter(
                caregiver=request.user,
                status="accepted",
            )
        )

        patients = []

        for connection in connections:

            patients.append({
                "id": connection.patient.id,
                "username": connection.patient.username,
                "email": connection.patient.email,
            })

        return Response(
            patients
        )

    @action(
        detail=False,
        methods=["get"],
    )
    def patient_doses(
        self,
        request,
    ):

        from medicine.models import DoseRecord

        patient_id = request.query_params.get(
            "patient_id"
        )

        if not patient_id:

            return Response(
                {
                    "error":
                    "patient_id is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        connection_exists = (
            CaregiverConnection.objects.filter(
                caregiver=request.user,
                patient_id=patient_id,
                status="accepted",
            ).exists()
        )

        if not connection_exists:

            return Response(
                {
                    "error":
                    "You are not connected to this patient."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        doses = DoseRecord.objects.filter(
            schedule__medicine__user_id=patient_id
        ).select_related(
            "schedule",
            "schedule__medicine",
        ).order_by(
            "-scheduled_at"
        )[:100]

        data = []

        for dose in doses:

            data.append({
                "id": dose.id,
                "medicine_name":
                    dose.schedule.medicine.name,
                "dosage":
                    dose.schedule.medicine.dosage,
                "scheduled_at":
                    dose.scheduled_at,
                "status":
                    dose.status,
                "confirmed_at":
                    dose.confirmed_at,
            })

        return Response(data)


class NotificationViewSet(
    viewsets.ModelViewSet
):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = NotificationSerializer

    def get_queryset(self):

        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by(
            "-created_at"
        )

    def perform_create(
        self,
        serializer
    ):

        serializer.save(
            recipient=self.request.user
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def mark_read(
        self,
        request,
        pk=None,
    ):

        notification = self.get_object()

        notification.is_read = True
        notification.save(
            update_fields=["is_read"]
        )

        return Response(
            NotificationSerializer(
                notification
            ).data
        )