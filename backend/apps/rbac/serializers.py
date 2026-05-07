from rest_framework import serializers
from .models import Role, Tienda, Permiso


class TiendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tienda
        fields = "__all__"


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"


class PermisoSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.CharField(source="rol.nombre", read_only=True)

    class Meta:
        model = Permiso
        fields = ("id", "rol", "rol_nombre", "accion", "recurso", "permitido")