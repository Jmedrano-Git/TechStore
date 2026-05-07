import re
from rest_framework import serializers
from .models import Usuario


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Usuario
        fields = ("email", "password", "nombre_completo", "tienda")

    def validate_password(self, value):
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Debe tener una mayúscula")
        if not re.search(r"\d", value):
            raise serializers.ValidationError("Debe tener un número")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError("Debe tener un carácter especial")
        return value

    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)


class UsuarioMiniSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.CharField(source="rol.nombre", default=None, read_only=True)
    tienda_nombre = serializers.CharField(source="tienda.nombre", default=None, read_only=True)

    class Meta:
        model = Usuario
        fields = (
            "id", "email", "nombre_completo",
            "tienda", "tienda_nombre",
            "rol", "rol_nombre",
            "activo", "bloqueado", "is_superuser",
        )