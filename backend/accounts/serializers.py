from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    UserProfile,
    CaregiverConnection,
    Notification,
)


class RegisterSerializer(
    serializers.ModelSerializer
):

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    role = serializers.ChoiceField(
        choices=[
            ("patient", "Patient"),
            ("caregiver", "Caregiver"),
        ],
        default="patient",
    )

    class Meta:
        model = User

        fields = [
            "username",
            "email",
            "password",
            "role",
        ]

    def create(self, validated_data):

        role = validated_data.pop(
            "role",
            "patient"
        )

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        UserProfile.objects.create(
            user=user,
            role=role,
        )

        return user


class UserSerializer(
    serializers.ModelSerializer
):

    role = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "role",
        ]

    def get_role(self, obj):

        try:
            return obj.profile.role

        except UserProfile.DoesNotExist:
            return "patient"


class CaregiverConnectionSerializer(
    serializers.ModelSerializer
):

    patient_username = serializers.CharField(
        source="patient.username",
        read_only=True,
    )

    caregiver_username = serializers.CharField(
        source="caregiver.username",
        read_only=True,
    )

    class Meta:
        model = CaregiverConnection

        fields = [
            "id",
            "patient",
            "patient_username",
            "caregiver",
            "caregiver_username",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "patient",
            "caregiver",
            "status",
            "created_at",
        ]


class NotificationSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = Notification

        fields = "__all__"

        read_only_fields = [
            "recipient",
            "created_at",
        ]