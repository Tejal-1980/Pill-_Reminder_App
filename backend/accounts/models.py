from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):

    ROLE_CHOICES = [
        ("patient", "Patient"),
        ("caregiver", "Caregiver"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="patient",
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class CaregiverConnection(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="caregiver_connections",
    )

    caregiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="patient_connections",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "patient",
                    "caregiver",
                ],
                name="unique_patient_caregiver",
            )
        ]

    def __str__(self):
        return (
            f"{self.patient.username} -> "
            f"{self.caregiver.username}"
        )


class Notification(models.Model):

    TYPE_CHOICES = [
        ("dose_taken", "Dose Taken"),
        ("dose_missed", "Dose Missed"),
        ("caregiver_request", "Caregiver Request"),
    ]

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications_about_me",
    )

    dose = models.ForeignKey(
        "medicine.DoseRecord",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES,
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.recipient.username} - "
            f"{self.notification_type}"
        )