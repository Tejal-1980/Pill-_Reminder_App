from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    MedicineViewSet,
    MedicineScheduleViewSet,
    DoseRecordViewSet,
)


router = DefaultRouter()

router.register(
    r"medicines",
    MedicineViewSet,
    basename="medicine"
)

router.register(
    r"schedules",
    MedicineScheduleViewSet,
    basename="schedule"
)

router.register(
    r"doses",
    DoseRecordViewSet,
    basename="dose"
)


urlpatterns = [
    path(
        "",
        include(router.urls)
    )
]