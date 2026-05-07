"""
Permisos por defecto según el documento del laboratorio.
"""
from .models import Role, Permiso


# Matriz de permisos por defecto (ROL → {ACCION → {RECURSO → permitido}})
DEFAULTS = {
    "Admin": {
        "Producto":  {"SELECT": True, "INSERT": True, "UPDATE": True, "UPDATE_STOCK": True, "DELETE": True},
        "Usuario":   {"SELECT": True, "INSERT": True, "UPDATE": True, "DELETE": True},
        "Role":      {"SELECT": True, "INSERT": True, "UPDATE": True, "DELETE": True},
        "AuditLog":  {"SELECT": True},
    },
    "Gerente": {
        "Producto":  {"SELECT": True, "INSERT": True, "UPDATE": True, "UPDATE_STOCK": True, "DELETE": True},
        "Usuario":   {"SELECT": False, "INSERT": False, "UPDATE": False, "DELETE": False},
        "Role":      {"SELECT": True, "INSERT": False, "UPDATE": False, "DELETE": False},
        "AuditLog":  {"SELECT": False},
    },
    "Empleado": {
        "Producto":  {"SELECT": True, "INSERT": False, "UPDATE": False, "UPDATE_STOCK": True, "DELETE": False},
        "Usuario":   {"SELECT": False, "INSERT": False, "UPDATE": False, "DELETE": False},
        "Role":      {"SELECT": True, "INSERT": False, "UPDATE": False, "DELETE": False},
        "AuditLog":  {"SELECT": False},
    },
    "Auditor": {
        "Producto":  {"SELECT": True, "INSERT": False, "UPDATE": False, "UPDATE_STOCK": False, "DELETE": False},
        "Usuario":   {"SELECT": False, "INSERT": False, "UPDATE": False, "DELETE": False},
        "Role":      {"SELECT": True, "INSERT": False, "UPDATE": False, "DELETE": False},
        "AuditLog":  {"SELECT": True},
    },
}


def sembrar_permisos_default(reset=False):
    """Crea o actualiza permisos por defecto. Si reset=True, sobreescribe los existentes."""
    for nombre_rol, recursos in DEFAULTS.items():
        rol, _ = Role.objects.get_or_create(nombre=nombre_rol, defaults={"descripcion": f"Rol {nombre_rol}"})
        for recurso, acciones in recursos.items():
            for accion, permitido in acciones.items():
                if reset:
                    Permiso.objects.update_or_create(
                        rol=rol, accion=accion, recurso=recurso,
                        defaults={"permitido": permitido},
                    )
                else:
                    Permiso.objects.get_or_create(
                        rol=rol, accion=accion, recurso=recurso,
                        defaults={"permitido": permitido},
                    )