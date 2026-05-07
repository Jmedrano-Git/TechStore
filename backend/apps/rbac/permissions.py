from rest_framework.permissions import BasePermission


def get_user_role(user):
    if not user.is_authenticated:
        return None
    if user.is_superuser:
        return "Admin"
    return user.rol.nombre if user.rol else None


class HasRole(BasePermission):
    allowed = ()

    @classmethod
    def of(cls, *roles):
        return type("HasRoleX", (cls,), {"allowed": roles})

    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in self.allowed


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) == "Admin"