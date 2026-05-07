from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.authx.models import Usuario
from apps.authx.serializers import UsuarioMiniSerializer

from .models import Role, Tienda, Permiso
from .serializers import RoleSerializer, TiendaSerializer, PermisoSerializer
from .permissions import IsAdmin


class TiendaViewSet(viewsets.ModelViewSet):
    queryset = Tienda.objects.all().order_by("nombre")
    serializer_class = TiendaSerializer

    def get_permissions(self):
        if self.action == "list":
            return [AllowAny()]
        return [IsAdmin()]


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all().order_by("nombre")
    serializer_class = RoleSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsAdmin()]

    def destroy(self, request, *args, **kwargs):
        rol = self.get_object()
        if Usuario.objects.filter(rol=rol).exists():
            return Response(
                {"detail": "No se puede eliminar: hay usuarios con este rol."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class UsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioMiniSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Usuario.objects.filter(is_superuser=False).order_by("-fecha_creacion")

    @action(detail=True, methods=["post"])
    def asignar_rol(self, request, pk=None):
        user = self.get_object()
        rol_id = request.data.get("rol_id")
        if rol_id in (None, ""):
            user.rol = None
        else:
            try:
                user.rol = Role.objects.get(id=rol_id)
            except Role.DoesNotExist:
                return Response({"detail": "Rol no encontrado"}, status=404)
        user.save()
        return Response(UsuarioMiniSerializer(user).data)

    @action(detail=True, methods=["post"])
    def desbloquear(self, request, pk=None):
        u = self.get_object()
        u.bloqueado = False
        u.intentos_fallidos = 0
        u.save()
        return Response({"mensaje": "Usuario desbloqueado"})


class PermisoViewSet(viewsets.ModelViewSet):
    """Matriz editable: solo Admin gestiona; cualquier autenticado puede leer la suya."""
    queryset = Permiso.objects.select_related("rol").all()
    serializer_class = PermisoSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve", "mis_permisos"):
            return [IsAuthenticated()]
        return [IsAdmin()]

    @action(detail=False, methods=["get"], url_path="mis-permisos")
    def mis_permisos(self, request):
        """Devuelve los permisos del rol del usuario actual (para que el front muestre/oculte botones)."""
        user = request.user
        if user.is_superuser:
            # Admin = todo permitido
            from itertools import product
            acciones = [a[0] for a in Permiso.ACCIONES]
            recursos = [r[0] for r in Permiso.RECURSOS]
            data = [{"accion": a, "recurso": r, "permitido": True} for a, r in product(acciones, recursos)]
            return Response(data)
        if not user.rol:
            return Response([])
        permisos = Permiso.objects.filter(rol=user.rol).values("accion", "recurso", "permitido")
        return Response(list(permisos))

    @action(detail=False, methods=["post"])
    def reset(self, request):
        """Solo admin: restablece la matriz a los valores por defecto del documento."""
        if not (request.user.is_superuser or (request.user.rol and request.user.rol.nombre == "Admin")):
            return Response({"detail": "Sin permiso"}, status=403)
        from .seed_permissions import sembrar_permisos_default
        sembrar_permisos_default(reset=True)
        return Response({"mensaje": "Permisos restablecidos a valores por defecto"})