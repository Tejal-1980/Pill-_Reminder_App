from django.db import models
from django.contrib.auth.models import User


class Medicine(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="medicines"
    )

    name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)

    start_date = models.DateField()
    end_date = models.DateField(
        null=True,
        blank=True
    )

    instructions = models.TextField(
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name


class MedicineSchedule(models.Model):
    FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("twice_daily", "Twice Daily"),
        ("weekly", "Weekly"),
    ]

    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.CASCADE,
        related_name="schedules"
    )

    time = models.TimeField()

    frequency = models.CharField(
        max_length=30,
        choices=FREQUENCY_CHOICES,
        default="daily"
    )

    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return f"{self.medicine.name} - {self.time}"


class DoseRecord(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("taken", "Taken"),
        ("skipped", "Skipped"),
        ("missed", "Missed"),
    ]

    schedule = models.ForeignKey(
        MedicineSchedule,
        on_delete=models.CASCADE,
        related_name="dose_records"
    )

    scheduled_at = models.DateTimeField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    confirmed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return (
            f"{self.schedule.medicine.name} - "
            f"{self.scheduled_at} - {self.status}"
        )