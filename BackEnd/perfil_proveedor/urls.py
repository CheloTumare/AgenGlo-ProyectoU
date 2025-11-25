from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PerfilProveedorViewSet, CrearSolicitudProveedorView, ActualizarEstadoSolicitudView

router = DefaultRouter()
router.register(r'perfil-proveedor', PerfilProveedorViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('solicitud-proveedor/', CrearSolicitudProveedorView.as_view(), name='crear-solicitud-proveedor'),
    path('solicitud-proveedor/<int:pk>/estado/', ActualizarEstadoSolicitudView.as_view())
]