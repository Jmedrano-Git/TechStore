from django.db import models


class Tienda(models.Model):
    nombre = models.CharField(max_length=80, unique=True)

    def __str__(self):
        return self.nombre


class Role(models.Model):
    nombre = models.CharField(max_length=40, unique=True)
    descripcion = models.CharField(max_length=200, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


class Permiso(models.Model):
    """
    Matriz editable de permisos: ¿Rol X puede hacer ACCION sobre RECURSO?
    El admin puede ajustar estos valores desde la UI.
    Las reglas estructurales (filtrar por tienda, no premium para empleado) siguen
    siendo del policy engine; estos permisos son las palancas de alto nivel.
    """
    ACCIONES = [
        ("SELECT", "Ver"),
        ("INSERT", "Crear"),
        ("UPDATE", "Editar"),
        ("UPDATE_STOCK", "Editar stock"),
        ("DELETE", "Eliminar"),
    ]
    RECURSOS = [
        ("Producto", "Producto"),
        ("Usuario", "Usuario"),
        ("Role", "Rol"),
        ("AuditLog", "Auditoría"),
    ]

    rol = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="permisos")
    accion = models.CharField(max_length=20, choices=ACCIONES)
    recurso = models.CharField(max_length=20, choices=RECURSOS)
    permitido = models.BooleanField(default=False)

    class Meta:
        unique_together = ("rol", "accion", "recurso")
        ordering = ["rol__nombre", "recurso", "accion"]

    def __str__(self):
        estado = "✓" if self.permitido else "✕"
        return f"{estado} {self.rol.nombre}: {self.accion} {self.recurso}"