from django.db import models
from django.core.validators import MinValueValidator,MaxValueValidator
from accounts.models import User
from .choices import TIPOS_SERVICIO, Estado_Cita

# Create your models here.
class Servicio(models.Model):
    proveedor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'is_staff':True})
    nombre_servicio = models.CharField(max_length=100)
    tipo_servicio = models.CharField(max_length=30, choices=TIPOS_SERVICIO)
    descripcion = models.TextField(blank=True)
    duracion = models.DurationField()
    precio = models.IntegerField(null=False,blank=False,default=1000,validators=[
        MinValueValidator(1000),
        MaxValueValidator(1000000)
    ])
    
    def __str__(self):
        return f"{self.nombre_servicio.capitalize()} - {self.proveedor.get_full_name.capitalize()}"
    
class Disponibilidad(models.Model):
    proveedor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'is_staff':True})
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    cupos = models.PositiveIntegerField(default=1)
    
    class Meta:
        unique_together = ('proveedor','fecha','hora_inicio') # No se pueden haber filas con los mismos datos
    
    def __str__(self):
        return f"{self.proveedor.get_full_name.capitalize()} - {self.fecha} {self.hora_inicio}"

class Cita(models.Model):
    cliente = models.ForeignKey(User,on_delete=models.CASCADE, limit_choices_to={'is_staff': False})
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    fecha = models.DateField()
    hora = models.TimeField()
    estado = models.CharField(
        max_length=20,
        choices=Estado_Cita,
        default='pendiente'
    )
    comentario = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.cliente.get_full_name.capitalize()} - {self.servicio.nombre_servicio.capitalize()} ({self.fecha} {self.hora})"