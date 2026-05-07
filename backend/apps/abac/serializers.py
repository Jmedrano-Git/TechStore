from rest_framework import serializers
from .models import Producto, AccessLog


class ProductoSerializer(serializers.ModelSerializer):
    tienda_nombre = serializers.CharField(source="tienda.nombre", read_only=True)
    creado_por_email = serializers.CharField(source="creado_por.email", read_only=True)

    class Meta:
        model = Producto
        fields = "__all__"
        read_only_fields = ("creado_por", "fecha_creacion", "fecha_actualizacion")


class AccessLogSerializer(serializers.ModelSerializer):
    usuario_email = serializers.CharField(source="usuario.email", read_only=True)

    class Meta:
        model = AccessLog
        fields = "__all__"