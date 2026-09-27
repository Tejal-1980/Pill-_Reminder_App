from rest_framework import serializers
from .models import Medicine, MedicineSchedule, DoseRecord


class MedicineScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineSchedule
        fields = "__all__"


class DoseRecordSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(
        source="schedule.medicine.name",
        read_only=True
    )

    dosage = serializers.CharField(
        source="schedule.medicine.dosage",
        read_only=True
    )

    scheduled_time = serializers.TimeField(
        source="schedule.time",
        read_only=True
    )

    class Meta:
        model = DoseRecord
        fields = [
            "id",
            "schedule",
            "medicine_name",
            "dosage",
            "scheduled_time",
            "scheduled_at",
            "status",
            "confirmed_at",
        ]


class MedicineSerializer(serializers.ModelSerializer):
    schedules = MedicineScheduleSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Medicine
        fields = [
            "id",
            "user",
            "name",
            "dosage",
            "start_date",
            "end_date",
            "instructions",
            "is_active",
            "created_at",
            "schedules",
        ]

        read_only_fields = [
            "user",
            "created_at",
        ]