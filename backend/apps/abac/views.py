from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Producto, AccessLog
from .serializers import ProductoSerializer, AccessLogSerializer
from . import policy_engine as pe


CAMPOS_NO_EDITABLES = {
    "id", "tienda_nombre", "creado_por", "creado_por_email",
    "fecha_creacion", "fecha_actualizacion",
}


def log(user, accion, recurso, permitido, detalle=""):
    AccessLog.objects.create(
        usuario=user if user.is_authenticated else None,
        accion=accion, recurso=recurso,
        permitido=permitido, detalle=detalle[:200],
    )


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related("tienda", "creado_por").all().order_by("-fecha_creacion")
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        rol = pe.get_role(user)
        if rol in ("Admin", "Auditor"):
            return qs
        if rol in ("Gerente", "Empleado"):
            return qs.filter(tienda_id=user.tienda_id)
        return qs.none()

    def list(self, request, *a, **kw):
        ok, _ = pe.can_select(request.user)
        log(request.user, "SELECT", "Producto:list", ok)
        return super().list(request, *a, **kw)

    def create(self, request, *a, **kw):
        ok, motivo = pe.can_insert(request.user, request.data)
        log(request.user, "INSERT", "Producto", ok, motivo)
        if not ok:
            return Response({"detail": f"ABAC denegó: {motivo}"}, status=403)
        return super().create(request, *a, **kw)

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)

    def _data_limpia(self, request):
        """Quita campos read-only que el frontend reenvía sin querer."""
        return {k: v for k, v in request.data.items() if k not in CAMPOS_NO_EDITABLES}

    def update(self, request, *a, **kw):
        producto = self.get_object()
        data = self._data_limpia(request)
        ok, motivo = pe.can_update(request.user, producto, data)
        log(request.user, "UPDATE", f"Producto:{producto.id}", ok, motivo)
        if not ok:
            return Response({"detail": f"ABAC denegó: {motivo}"}, status=403)
        return super().update(request, *a, **kw)

    def partial_update(self, request, *a, **kw):
        producto = self.get_object()
        data = self._data_limpia(request)
        ok, motivo = pe.can_update(request.user, producto, data)
        log(request.user, "UPDATE", f"Producto:{producto.id}", ok, motivo)
        if not ok:
            return Response({"detail": f"ABAC denegó: {motivo}"}, status=403)
        return super().partial_update(request, *a, **kw)

    def destroy(self, request, *a, **kw):
        producto = self.get_object()
        ok, motivo = pe.can_delete(request.user, producto)
        log(request.user, "DELETE", f"Producto:{producto.id}", ok, motivo)
        if not ok:
            return Response({"detail": f"ABAC denegó: {motivo}"}, status=403)
        return super().destroy(request, *a, **kw)


class AccessLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AccessLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        rol = pe.get_role(self.request.user)
        if rol in ("Admin", "Auditor"):
            return AccessLog.objects.all().order_by("-fecha")
        return AccessLog.objects.none()