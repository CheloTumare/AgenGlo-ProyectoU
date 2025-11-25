from django.db import models
from accounts.models import User
from django.core.exceptions import ValidationError
# Create your models here.

def validar_proveedor(user):
    if not User.is_staff:
        raise ValidationError("Solo usuarios con is_staff en True pueden estar asociados a un perfil")
    

class PerfilProveedor(models.Model):
    usuario = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="perfil_proveedor",
        limit_choices_to={'is_staff': True},
        validators=[validar_proveedor]
    )
    nombre_empresa = models.CharField(max_length=255)
    direccion = models.CharField(max_length=255)
    descripcion_empresa = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    def clean(self):
        validar_proveedor(self.usuario)

    def __str__(self):
        return f"{self.nombre_empresa} ({self.usuario.email})"
    
    class Meta:
        verbose_name = 'Perfil de Proveedor'
        verbose_name_plural = 'Perfiles de Proveedores'

class SolicitudProveedor(models.Model):
    usuario =models.ForeignKey(User, on_delete=models.CASCADE)
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(
        max_length=20,
        choices=[('pendiente', 'Pendiente'),('aprobada','Aprobada'),('rechazada','Rechazada')],
        default='pendiente'
    )
    mensaje = models.TextField(blank=True)

