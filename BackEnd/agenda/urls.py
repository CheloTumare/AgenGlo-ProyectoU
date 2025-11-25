from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'servicios', views.ServicioViewSet)
router.register(r'disponibilidades', views.DisponibilidadViewSet)
router.register(r'citas',views.CitaViewSet)

urlpatterns = [
    path('agend/', include(router.urls)),
    path('agend/comercios/', views.ComercioListView.as_view(), name='comercio-list'),
    path('agend/comercios/<int:pk>/', views.ComercioDetalleView.as_view(), name='comercio-detalle'),
    path('agend/comercios/<int:comercio_id>/disponibilidad/', views.ComercioDisponibilidadView.as_view(), name='comercio-disponibilidad'),
]

# Endpoints generados automáticamente:
"""
SERVICIOS:
GET    /api/servicios/                     - Lista de servicios
POST   /api/servicios/                     - Crear servicio
GET    /api/servicios/{id}/                - Detalle de servicio
PUT    /api/servicios/{id}/                - Actualizar servicio completo
PATCH  /api/servicios/{id}/                - Actualizar servicio parcial
DELETE /api/servicios/{id}/                - Eliminar servicio
GET    /api/servicios/mis_servicios/       - Mis servicios (staff)
GET    /api/servicios/tipos_servicio/      - Lista de tipos de servicio

DISPONIBILIDADES:
GET    /api/disponibilidades/              - Lista de disponibilidades
POST   /api/disponibilidades/              - Crear disponibilidad
GET    /api/disponibilidades/{id}/         - Detalle de disponibilidad
PUT    /api/disponibilidades/{id}/         - Actualizar disponibilidad
DELETE /api/disponibilidades/{id}/         - Eliminar disponibilidad
GET    /api/disponibilidades/mis_disponibilidades/ - Mis disponibilidades (staff)
GET    /api/disponibilidades/disponibles/  - Solo disponibilidades con cupos

CITAS:
GET    /api/citas/                         - Lista de citas
POST   /api/citas/                         - Crear cita
GET    /api/citas/{id}/                    - Detalle de cita
PUT    /api/citas/{id}/                    - Actualizar cita
DELETE /api/citas/{id}/                    - Eliminar cita
GET    /api/citas/mis_citas/               - Mis citas
PATCH  /api/citas/{id}/cambiar_estado/     - Cambiar estado de cita
GET    /api/citas/proximas/                - Próximas citas
GET    /api/citas/estados/                 - Lista de estados de cita

FILTROS DISPONIBLES:
Servicios: ?proveedor=1&tipo=corte&precio_min=1000&precio_max=50000
Disponibilidades: ?proveedor=1&fecha=2025-06-25&fecha_desde=2025-06-01&fecha_hasta=2025-06-30
Citas: ?cliente=1&proveedor=1&estado=pendiente&fecha=2025-06-25&fecha_desde=2025-06-01&fecha_hasta=2025-06-30
"""