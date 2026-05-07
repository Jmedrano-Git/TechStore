from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("productos", views.ProductoViewSet)
router.register("logs", views.AccessLogViewSet, basename="logs")

urlpatterns = router.urls