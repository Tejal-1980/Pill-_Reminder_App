from django.contrib import admin

from .models import (
    UserProfile,
    CaregiverConnection,
    Notification,
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):

    list_display = [
        "user",
        "role",
    ]


@admin.register(CaregiverConnection)
class CaregiverConnectionAdmin(admin.ModelAdmin):

    list_display = [
        "patient",
        "caregiver",
        "status",
        "created_at",
    ]

    list_filter = [
        "status",
    ]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = [
        "recipient",
        "notification_type",
        "is_read",
        "created_at",
    ]

    list_filter = [
        "notification_type",
        "is_read",
    ]