from django.contrib import admin

from .models import (
    Medicine,
    MedicineSchedule,
    DoseRecord,
)


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "dosage",
        "user",
        "start_date",
        "end_date",
        "is_active",
    )

    list_filter = (
        "is_active",
        "start_date",
    )

    search_fields = (
        "name",
        "dosage",
        "user__username",
    )


@admin.register(MedicineSchedule)
class MedicineScheduleAdmin(admin.ModelAdmin):
    list_display = (
        "medicine",
        "time",
        "frequency",
        "is_active",
    )

    list_filter = (
        "frequency",
        "is_active",
    )


@admin.register(DoseRecord)
class DoseRecordAdmin(admin.ModelAdmin):
    list_display = (
        "schedule",
        "scheduled_at",
        "status",
        "confirmed_at",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "schedule__medicine__name",
    )