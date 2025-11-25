from django.contrib import admin
from .models import PerfilProveedor, SolicitudProveedor

class PerfilProveedorAdmin(admin.ModelAdmin):
    list_display = ('usuario','nombre_empresa', 'fecha_registro')
    search_fields = ('nombre_empresa',)
    list_filter = ('fecha_registro',)

admin.site.register(PerfilProveedor, PerfilProveedorAdmin)

class SolicitudProveedorAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'fecha_solicitud', 'estado', 'mensaje')
    list_filter = ('estado',)
    search_fields = ('usuario__email',)
    # Permite editar el campo estado directamente en la lista
    list_editable = ('estado',)

admin.site.register(SolicitudProveedor, SolicitudProveedorAdmin)
