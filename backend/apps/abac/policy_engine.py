"""
Motor ABAC. Combina:
1. Permisos de alto nivel (matriz editable en BD)
2. Reglas estructurales del documento (tienda propia, no premium para empleado, etc.)
"""
from apps.rbac.models import Permiso


def get_role(user):
    if not user or not user.is_authenticated:
        return None
    if user.is_superuser:
        return "Admin"
    return user.rol.nombre if user.rol else None


def _check_permiso(rol, accion, recurso):
    """Lee la matriz de permisos editable. Admin siempre pasa."""
    if rol == "Admin":
        return True
    try:
        p = Permiso.objects.get(rol__nombre=rol, accion=accion, recurso=recurso)
        return p.permitido
    except Permiso.DoesNotExist:
        return False


def can_select(user, producto=None):
    rol = get_role(user)
    if not _check_permiso(rol, "SELECT", "Producto"):
        return False, f"{rol or 'sin rol'}: sin permiso de lectura"

    if rol in ("Admin", "Auditor"):
        return True, "lectura total"
    if rol in ("Gerente", "Empleado"):
        if producto is None:
            return True, "lectura filtrada por tienda"
        if producto.tienda_id == user.tienda_id:
            return True, "producto de su tienda"
        return False, "producto fuera de su tienda"
    return False, "rol sin acceso"


def can_insert(user, data):
    rol = get_role(user)
    if not _check_permiso(rol, "INSERT", "Producto"):
        return False, f"{rol or 'sin rol'}: sin permiso de crear productos"

    if rol == "Admin":
        return True, "admin: insertar en cualquier tienda"
    if rol == "Gerente":
        try:
            tienda_data = int(data.get("tienda"))
        except (TypeError, ValueError):
            return False, "tienda inválida"
        if tienda_data == user.tienda_id:
            return True, "gerente: en su tienda"
        return False, "gerente: solo en su tienda"
    if rol == "Empleado":
        try:
            tienda_data = int(data.get("tienda"))
        except (TypeError, ValueError):
            return False, "tienda inválida"
        if tienda_data != user.tienda_id:
            return False, "empleado: solo en su tienda"
        if data.get("es_premium") in (True, "true", "True", 1, "1"):
            return False, "empleado: no puede crear productos premium"
        return True, "empleado: en su tienda y no premium"
    return False, "rol sin acceso"


def can_update(user, producto, data):
    rol = get_role(user)

    # ¿Solo está cambiando stock?
    es_solo_stock = set(data.keys()) == {"stock"} or (set(data.keys()) - {"stock"} == set())

    # Permiso requerido depende de qué edita
    if es_solo_stock:
        if not _check_permiso(rol, "UPDATE_STOCK", "Producto"):
            return False, f"{rol or 'sin rol'}: sin permiso de editar stock"
    else:
        if not _check_permiso(rol, "UPDATE", "Producto"):
            return False, f"{rol or 'sin rol'}: sin permiso de editar productos"

    if rol == "Admin":
        return True, "admin: actualización total"

    if rol == "Gerente":
        if producto.tienda_id != user.tienda_id:
            return False, "gerente: solo productos de su tienda"
        if "categoria" in data and str(data["categoria"]) != str(producto.categoria):
            return False, "gerente: no puede modificar categoría"
        return True, "gerente: actualización en su tienda"

    if rol == "Empleado":
        if producto.tienda_id != user.tienda_id:
            return False, "empleado: solo productos de su tienda"
        campos_permitidos = {"stock"}
        no_permitidos = set(data.keys()) - campos_permitidos
        if no_permitidos:
            return False, f"empleado: solo puede modificar stock; intentó {sorted(no_permitidos)}"
        return True, "empleado: actualiza stock"

    return False, "rol sin acceso"


def can_delete(user, producto):
    rol = get_role(user)
    if not _check_permiso(rol, "DELETE", "Producto"):
        return False, f"{rol or 'sin rol'}: sin permiso de eliminar"

    if rol == "Admin":
        return True, "admin: eliminar cualquier producto"
    if rol == "Gerente":
        if producto.tienda_id != user.tienda_id:
            return False, "gerente: solo productos de su tienda"
        if producto.es_premium:
            return False, "gerente: no puede eliminar productos premium"
        return True, "gerente: eliminación permitida"
    return False, "rol sin permiso"