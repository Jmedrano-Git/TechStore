import random
from datetime import timedelta
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("Email obligatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        extra.setdefault("activo", True)
        return self.create_user(email, password, **extra)


class Usuario(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    nombre_completo = models.CharField(max_length=150)
    tienda = models.ForeignKey(
        "rbac.Tienda", on_delete=models.SET_NULL, null=True, blank=True
    )
    rol = models.ForeignKey(
        "rbac.Role", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="usuarios",
    )
    mfa_habilitado = models.BooleanField(default=True)  # MFA por email siempre activo
    activo = models.BooleanField(default=True)
    intentos_fallidos = models.IntegerField(default=0)
    bloqueado = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nombre_completo"]

    objects = UsuarioManager()

    def __str__(self):
        return self.email


class CodigoMFA(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="codigos_mfa")
    codigo = models.CharField(max_length=6)
    creado = models.DateTimeField(auto_now_add=True)
    intentos = models.IntegerField(default=0)
    usado = models.BooleanField(default=False)

    @classmethod
    def generar(cls, usuario):
        cls.objects.filter(usuario=usuario, usado=False).update(usado=True)
        codigo = f"{random.randint(0, 999999):06d}"
        return cls.objects.create(usuario=usuario, codigo=codigo)

    def es_valido(self):
        if self.usado:
            return False
        if self.intentos >= 3:
            return False
        if timezone.now() - self.creado > timedelta(minutes=5):
            return False
        return True