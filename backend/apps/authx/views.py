from django.core.mail import send_mail
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import Usuario, CodigoMFA
from .serializers import RegisterSerializer, UsuarioMiniSerializer

MAX_INTENTOS_LOGIN = 5


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def enviar_codigo(usuario):
    cod = CodigoMFA.generar(usuario)
    send_mail(
        subject="TechStore - Tu código de verificación",
        message=(
            f"Hola {usuario.nombre_completo},\n\n"
            f"Tu código de verificación es: {cod.codigo}\n\n"
            f"Válido por 5 minutos. Si no solicitaste este código, ignora este correo.\n\n"
            f"— TechStore Security"
        ),
        from_email=None,
        recipient_list=[usuario.email],
        fail_silently=False,
    )
    return cod


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    s = RegisterSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    user = s.save()
    return Response(
        {"id": user.id, "email": user.email, "mensaje": "Registrado correctamente"},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_step1(request):
    """Paso 1: valida credenciales y envía código MFA al email."""
    email = request.data.get("email")
    password = request.data.get("password")

    try:
        user = Usuario.objects.get(email=email)
    except Usuario.DoesNotExist:
        return Response({"detail": "Credenciales inválidas"}, status=401)

    if user.bloqueado:
        return Response(
            {"detail": "Cuenta bloqueada por intentos fallidos. Contacta al administrador."},
            status=423,
        )

    if not user.is_superuser and user.rol is None:
        return Response(
            {"detail": "Tu cuenta aún no tiene un rol asignado. Espera a que un Administrador te lo asigne."},
            status=403,
        )

    auth = authenticate(request, email=email, password=password)
    if auth is None:
        user.intentos_fallidos += 1
        if user.intentos_fallidos >= MAX_INTENTOS_LOGIN:
            user.bloqueado = True
        user.save()
        return Response({"detail": "Credenciales inválidas"}, status=401)

    user.intentos_fallidos = 0
    user.save()

    enviar_codigo(user)
    return Response({
        "mfa_required": True,
        "user_id": user.id,
        "mensaje": f"Enviamos un código a {user.email}",
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def login_mfa(request):
    """Paso 2: verifica el código de 6 dígitos del email."""
    user_id = request.data.get("user_id")
    codigo = request.data.get("codigo", "").strip()

    try:
        user = Usuario.objects.get(id=user_id)
    except Usuario.DoesNotExist:
        return Response({"detail": "Usuario no encontrado"}, status=404)

    cod = CodigoMFA.objects.filter(usuario=user, usado=False).order_by("-creado").first()
    if not cod or not cod.es_valido():
        return Response({"detail": "Código expirado o inválido. Inicia sesión nuevamente."}, status=401)

    if cod.codigo != codigo:
        cod.intentos += 1
        cod.save()
        restantes = max(0, 3 - cod.intentos)
        return Response(
            {"detail": f"Código incorrecto. Te quedan {restantes} intento(s)."},
            status=401,
        )

    cod.usado = True
    cod.save()
    return Response(tokens_for(user))


@api_view(["POST"])
@permission_classes([AllowAny])
def reenviar_codigo(request):
    user_id = request.data.get("user_id")
    try:
        user = Usuario.objects.get(id=user_id)
    except Usuario.DoesNotExist:
        return Response({"detail": "Usuario no encontrado"}, status=404)
    enviar_codigo(user)
    return Response({"mensaje": "Código reenviado"})


@api_view(["GET"])
def me(request):
    return Response(UsuarioMiniSerializer(request.user).data)