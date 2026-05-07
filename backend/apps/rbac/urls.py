from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("tiendas", views.TiendaViewSet)
router.register("roles", views.RoleViewSet)
router.register("usuarios", views.UsuarioViewSet, basename="usuarios")
router.register("permisos", views.PermisoViewSet, basename="permisos")

urlpatterns = router.urls