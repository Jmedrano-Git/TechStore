#!/bin/sh
set -e

echo "Esperando DB..."
until python -c "import socket; socket.create_connection(('seguridad-db', 5432), timeout=2)" 2>/dev/null; do
  sleep 1
done

echo "Aplicando migraciones..."
python manage.py makemigrations authx rbac abac --noinput
python manage.py migrate --noinput

echo "Cargando datos iniciales..."
python manage.py shell <<'PYEOF'
from apps.rbac.models import Role, Tienda
from apps.rbac.seed_permissions import sembrar_permisos_default

for n in ["Admin", "Gerente", "Empleado", "Auditor"]:
    Role.objects.get_or_create(nombre=n, defaults={"descripcion": f"Rol {n}"})
for t in ["Lima", "Arequipa", "Cusco"]:
    Tienda.objects.get_or_create(nombre=t)

sembrar_permisos_default(reset=False)
print("Roles, tiendas y permisos por defecto listos.")
PYEOF

echo "Iniciando servidor..."
exec python manage.py runserver 0.0.0.0:8000