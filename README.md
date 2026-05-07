# 🛡️ TechStore — Sistema de Seguridad
 
![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-multi--stage-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/license-Academic-blue)
 
> Sistema completo de gestión de inventario con autenticación robusta, MFA por email, RBAC y ABAC.
> Desarrollado como **Laboratorio Calificado** del curso *Desarrollo de Soluciones en la Nube* — Tecsup.
 
---
 
## 📑 Tabla de contenidos
 
- [Descripción general](#-descripción-general)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación rápida](#-instalación-rápida)
- [Acceso a los servicios](#-acceso-a-los-servicios)
- [Características de seguridad](#-características-de-seguridad)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Roles y permisos](#-roles-y-permisos)
- [API Endpoints](#-api-endpoints)
- [Casos de prueba](#-casos-de-prueba)
---
 
## 📋 Descripción general
 
**TechStore** es una cadena de tiendas de tecnología con sucursales en Lima, Arequipa y Cusco. Esta aplicación implementa un sistema centralizado de gestión de inventario con controles de seguridad robustos para proteger datos sensibles y operaciones críticas del negocio.
 
El proyecto cumple los siguientes objetivos del laboratorio:
 
- ✅ Identificar conceptos principales de la seguridad en aplicaciones web
- ✅ Implementar autenticación multi-factor (MFA)
- ✅ Diseñar e implementar RBAC (Role-Based Access Control)
- ✅ Diseñar e implementar ABAC (Attribute-Based Access Control)
- ✅ Aplicar contenerización con Docker (multi-stage)
- ✅ Logging y auditoría de acciones críticas
---
 
## 🧱 Arquitectura
 
```
┌────────────────────────────────────────────────────────────────────┐
│                          DOCKER COMPOSE                            │
│                                                                    │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │  FRONTEND    │    │   BACKEND    │    │   POSTGRESQL 16      │  │
│  │  React 18    │◄──►│  Django 5    │◄──►│   Alpine             │  │
│  │  + Tailwind  │    │  + DRF       │    │                      │  │
│  │  Nginx       │    │  + JWT       │    │   Persistencia       │  │
│  │              │    │              │    │   en volumen         │  │
│  │  Puerto 3000 │    │  Puerto 8000 │    │   Puerto 5432        │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│                              │                                     │
│                              ▼                                     │
│                      ┌──────────────┐                              │
│                      │   MAILHOG    │                              │
│                      │   SMTP fake  │                              │
│                      │   Puerto 8025│                              │
│                      └──────────────┘                              │
└────────────────────────────────────────────────────────────────────┘
```
 
### Patrón arquitectónico
 
- **Backend**: MVT adaptado a API REST (Model–Serializer–View)
- **Frontend**: Arquitectura basada en componentes con Context API
- **Comunicación**: HTTP/JSON sobre red interna de Docker
- **Autenticación**: JWT con tokens de acceso (2h) y refresh (7d)
---
 
## 🧰 Tecnologías
 
### Backend
| Tecnología | Versión | Propósito |
|---|---|---|
| Python | 3.12 | Lenguaje base |
| Django | 5.0.6 | Framework web |
| Django REST Framework | 3.15.1 | API REST |
| SimpleJWT | 5.3.1 | Autenticación con tokens |
| PostgreSQL | 16 (Alpine) | Base de datos |
| psycopg2-binary | 2.9.9 | Driver PostgreSQL |
 
### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| React | 18.3.1 | Librería UI |
| Vite | 5.3.1 | Build tool |
| TailwindCSS | 3.4.4 | Estilos utility-first |
| React Router | 6.24.0 | Routing SPA |
| Axios | 1.7.2 | Cliente HTTP |
 
### Infraestructura
| Tecnología | Propósito |
|---|---|
| Docker + Docker Compose | Orquestación de contenedores |
| Multi-stage builds | Imágenes ligeras (ahorro de ~60% de espacio) |
| Nginx Alpine | Servidor estático del frontend |
| Mailhog | Captura de correos en desarrollo |
 
---
 
## 🚀 Instalación rápida
 
### Prerrequisitos
 
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- [Git](https://git-scm.com/) instalado
- 4 GB de RAM disponibles
> **Nota**: No necesitas instalar Python, Node ni PostgreSQL. Todo corre dentro de los contenedores.
 
### Pasos
 
```bash
# 1. Clonar el repositorio
git clone https://github.com/Jmedrano-Git/TechStore.git
cd techstore-seguridad
 
# 2. Crear archivo de variables de entorno
cp .env.example .env
 
# 3. Levantar todos los servicios
docker compose up --build
```
### Crear superusuario (en otra terminal)
 
```bash
docker compose exec seguridad-backend python manage.py createsuperuser
```
 
Te pedirá:
- Email
- Nombre completo
- Contraseña (mínimo 8 caracteres, mayúscula, número y carácter especial)
### Detener todo
 
```bash
# Detener (mantiene los datos)
docker compose down
 
# Detener Y borrar la base de datos
docker compose down -v
```
 
---
 
## 🌐 Acceso a los servicios
 
| Servicio | URL | Descripción |
|---|---|---|
| 🖥️ **Frontend** | http://localhost:3000 | Interfaz de usuario |
| 🔌 **Backend API** | http://localhost:8000/api/ | API REST |
| ⚙️ **Django Admin** | http://localhost:8000/admin/ | Panel de administración |
| 📧 **Mailhog** | http://localhost:8025 | Buzón de correos MFA |
| 🗄️ **PostgreSQL** | localhost:5432 | Base de datos |
 
---
 
## 🔐 Características de seguridad
 
### 🔑 Autenticación
 
| Característica | Implementación |
|---|---|
| Hashing de contraseñas | PBKDF2 (Django default) |
| Validación de contraseña | Min 8 caracteres, mayúscula, número y carácter especial |
| Tokens | JWT con SimpleJWT (access 2h, refresh 7d) |
| Bloqueo por intentos | Cuenta bloqueada tras 5 intentos fallidos |
| Sesiones | Token-based, sin cookies del lado del servidor |
 
### 📨 MFA por Email (Opción B del laboratorio)
 
- Código de **6 dígitos** generado por usuario
- **Válido por 5 minutos**
- Máximo **3 intentos** antes de invalidarse
- Capturado en desarrollo por **Mailhog** (`localhost:8025`)
- Envío real por SMTP en producción (configurable vía variables de entorno)
```
Flujo:
1. Usuario ingresa email + password ✓
2. Backend genera código y envía email
3. Usuario ingresa código de 6 dígitos
4. Si es correcto → entrega tokens JWT
5. Si supera 3 intentos → invalida y debe reiniciar login
```
 
### 🛡️ RBAC (Role-Based Access Control)
 
Sistema con **4 roles predefinidos**: Admin, Gerente, Empleado, Auditor.
 
**CRUDs implementados:**
- ✅ CRUD de Roles
- ✅ CRUD de Usuarios
- ✅ CRUD de Tiendas
- ✅ Asignación de roles a usuarios
- ✅ Matriz editable de permisos
### 🎯 ABAC (Attribute-Based Access Control)
 
Motor de políticas (`policy_engine.py`) que evalúa atributos del **sujeto** y del **recurso**.
 
**Atributos del sujeto:**
- Rol asignado
- Tienda del usuario
- Estado (activo/bloqueado)
**Atributos del recurso:**
- Tienda del producto
- Tipo (premium/estándar)
**Cada decisión se registra** en la tabla `AccessLog` con motivo (permitido/denegado).
 
---
 
## 📦 Estructura del proyecto
 
```
techstore-seguridad/
├── 📄 docker-compose.yml          # Orquestación de servicios
├── 📄 .env.example                # Plantilla de variables
├── 📄 .gitignore                  # Archivos ignorados por Git
├── 📄 README.md                   # Este archivo
├── 📄 PRUEBAS.md                  # Guía de pruebas manuales
│
├── 📁 backend/                    # Django + DRF
│   ├── 🐳 Dockerfile              # Multi-stage Python 3.12 Alpine
│   ├── 📄 .dockerignore
│   ├── 📄 requirements.txt
│   ├── 📄 entrypoint.sh           # Migraciones + seed automático
│   ├── 📄 manage.py
│   │
│   ├── 📁 core/                   # Configuración Django
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   └── 📁 apps/
│       ├── 📁 authx/              # 🔑 Autenticación + MFA
│       │   ├── models.py          # Usuario + CodigoMFA
│       │   ├── serializers.py
│       │   ├── views.py           # login, MFA, register
│       │   └── urls.py
│       │
│       ├── 📁 rbac/               # 🛡️ Roles, Usuarios, Permisos
│       │   ├── models.py          # Role, Tienda, Permiso
│       │   ├── permissions.py     # IsAdmin, HasRole
│       │   ├── seed_permissions.py
│       │   ├── views.py           # CRUDs
│       │   └── urls.py
│       │
│       └── 📁 abac/               # 🎯 Productos + Policy Engine
│           ├── models.py          # Producto, AccessLog
│           ├── policy_engine.py   # Motor de decisiones
│           ├── views.py
│           └── urls.py
│
└── 📁 frontend/                   # React + Vite
    ├── 🐳 Dockerfile              # Multi-stage Node 20 + Nginx
    ├── 📄 .dockerignore
    ├── 📄 nginx.conf
    ├── 📄 package.json
    ├── 📄 vite.config.js
    ├── 📄 tailwind.config.js
    │
    └── 📁 src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        │
        ├── 📁 api/
        │   └── client.js          # Axios + JWT interceptor
        │
        ├── 📁 context/
        │   ├── AuthContext.jsx    # Estado global de auth
        │   └── ToastContext.jsx   # Notificaciones
        │
        ├── 📁 components/
        │   ├── Sidebar.jsx
        │   ├── Card.jsx
        │   └── ProtectedRoute.jsx
        │
        └── 📁 pages/
            ├── Login.jsx
            ├── MfaVerify.jsx      # Inputs estilo PIN
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Products.jsx
            ├── Roles.jsx
            ├── Users.jsx
            ├── Permissions.jsx    # Matriz editable
            └── AuditLogs.jsx
```
 
---
 
## 👥 Roles y permisos
 
### Matriz por defecto (alineada al documento del laboratorio)
 
| Acción | Admin | Gerente | Empleado | Auditor |
|---|:---:|:---:|:---:|:---:|
| **PRODUCTOS** | | | | |
| Ver productos | ✅ Todos | ✅ Su tienda | ✅ Su tienda | ✅ Todos |
| Crear producto | ✅ | ✅ Su tienda | ✅ No premium | ❌ |
| Editar producto | ✅ Todos los campos | ✅ Excepto categoría | ❌ | ❌ |
| Editar stock | ✅ | ✅ | ✅ Solo stock | ❌ |
| Eliminar producto | ✅ | ✅ No premium | ❌ | ❌ |
| **ADMINISTRACIÓN** | | | | |
| Gestionar usuarios | ✅ | ❌ | ❌ | ❌ |
| Gestionar roles | ✅ | ❌ | ❌ | ❌ |
| Editar matriz de permisos | ✅ | ❌ | ❌ | ❌ |
| Ver auditoría | ✅ | ❌ | ❌ | ✅ |
 
> **Nota**: La matriz es **editable** por el Administrador desde la sección "Permisos" del panel.
 
### Perfiles según el documento
 
| Perfil | Responsabilidades |
|---|---|
| **Administrador del Sistema** | Gestiona usuarios y roles, configuración completa del sistema, acceso total a todas las funcionalidades |
| **Gerente de Tienda** | Gestiona productos de su tienda, visualiza reportes de su ubicación, no puede eliminar productos de otras tiendas |
| **Empleado de Ventas** | Consulta productos, actualiza stock en tiempo real, no puede modificar precios |
| **Auditor** | Solo lectura de todos los datos, genera reportes, sin permisos de modificación |
 
---
 
## 🔌 API Endpoints
 
### Autenticación (`/api/auth/`)
 
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | `/register/` | Registrar nuevo usuario | ❌ |
| POST | `/login/` | Login paso 1 (envía código MFA) | ❌ |
| POST | `/login/mfa/` | Login paso 2 (verifica código) | ❌ |
| POST | `/login/reenviar/` | Reenviar código MFA | ❌ |
| GET | `/me/` | Datos del usuario actual | ✅ |
 
### RBAC (`/api/rbac/`)
 
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/tiendas/` | Listar tiendas | ❌ |
| CRUD | `/roles/` | Gestión de roles | Admin |
| CRUD | `/usuarios/` | Gestión de usuarios | Admin |
| POST | `/usuarios/{id}/asignar_rol/` | Asignar rol | Admin |
| POST | `/usuarios/{id}/desbloquear/` | Desbloquear cuenta | Admin |
| CRUD | `/permisos/` | Matriz de permisos | Admin |
| GET | `/permisos/mis-permisos/` | Permisos del usuario actual | ✅ |
| POST | `/permisos/reset/` | Restablecer matriz por defecto | Admin |
 
### ABAC (`/api/abac/`)
 
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| CRUD | `/productos/` | Gestión de productos (con ABAC) | ✅ |
| GET | `/logs/` | Registro de auditoría | Admin/Auditor |
 
---
 
## 🧪 Casos de prueba
 
### Escenario 1: Login con MFA ✅
```
Usuario: gerente.lima@techstore.com
1. Ingresa email + password correctos
2. Sistema envía código de 6 dígitos al email
3. Usuario abre Mailhog (http://localhost:8025) y obtiene código
4. Ingresa código → ✅ Acceso concedido + JWT
```
 
### Escenario 2: RBAC - Intento no autorizado ❌
```
Usuario: empleado.lima@techstore.com (Rol: Empleado)
Acción: POST /api/rbac/roles/
Resultado: ❌ 403 Forbidden — "No tienes permisos de Administrador"
```
 
### Escenario 3: ABAC - Gerente modifica producto ✅
```
Usuario: gerente.lima@techstore.com (Tienda: Lima)
Producto: Laptop HP (Tienda: Lima, Premium: true)
Acción: PATCH precio → ✅ Permitido
Acción: PATCH categoria → ❌ "Gerente no puede modificar categoría"
```
 
### Escenario 4: ABAC - Empleado intenta eliminar ❌
```
Usuario: empleado.lima@techstore.com (Rol: Empleado)
Producto: Mouse Logitech (Su tienda)
Acción: DELETE → ❌ "Empleados y Auditores no pueden eliminar productos"
```
 
### Escenario 5: Matriz dinámica ✅
```
Como Admin: desactivar permiso "UPDATE_STOCK" para Empleado
Como Empleado: los botones +/- de stock desaparecen
Como Admin: reactivar → los botones reaparecen
```
