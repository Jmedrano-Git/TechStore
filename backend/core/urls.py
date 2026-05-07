from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.authx.urls")),
    path("api/rbac/", include("apps.rbac.urls")),
    path("api/abac/", include("apps.abac.urls")),
]