from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register),
    path("login/", views.login_step1),
    path("login/mfa/", views.login_mfa),
    path("login/reenviar/", views.reenviar_codigo),
    path("me/", views.me),
]