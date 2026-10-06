from django.urls import include, path

from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    MeView,
    CaregiverViewSet,
    NotificationViewSet,
)


router = DefaultRouter()

router.register(
    r"caregiver",
    CaregiverViewSet,
    basename="caregiver",
)

router.register(
    r"notifications",
    NotificationViewSet,
    basename="notification",
)


urlpatterns = [

    path(
        "register/",
        RegisterView.as_view(),
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(),
    ),

    path(
        "refresh/",
        TokenRefreshView.as_view(),
    ),

    path(
        "me/",
        MeView.as_view(),
    ),

    path(
        "",
        include(router.urls),
    ),
]