from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
from .managers import UserManager
from rest_framework_simplejwt.tokens import RefreshToken

AUTH_PROVIDERS = {'email':'email', 'google':'google','github':'github','facebook':'facebook'}

telefono_regex = RegexValidator(
    regex=r'^\+?1?\d{9,15}$',
    message="El número debe tener el formato: '+56912345678'. Hasta 15 dígitos permitos."
)

rut_regex = RegexValidator(
    regex=r'^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]{1}$',
    message="El rut debe tener el formato: '12.345.678-5' o '12345678-5'."
)

class User(AbstractBaseUser, PermissionsMixin):
    # Campos básicos (ya existentes)
    email = models.EmailField(max_length=255, unique=True, verbose_name=_("Direccion de Correo Electrónico"))
    nombre = models.CharField(max_length=100, verbose_name=_("Nombre Completo"))
    apellidos = models.CharField(max_length=100, verbose_name=_("Apellidos"))
    telefono = models.CharField(validators=[telefono_regex], max_length=17, blank=True, null=True)
    rut = models.CharField(validators=[rut_regex], max_length=15, unique=True, null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    auth_provider = models.CharField(max_length=50, default=AUTH_PROVIDERS.get("email"))
    
    # ========== CAMPOS NUEVOS PARA PERFIL CLIENTE ==========
    codigo_pais = models.CharField(max_length=5, default="+56", blank=True)
    direccion_calle = models.CharField(max_length=200, blank=True, null=True)
    direccion_numero = models.CharField(max_length=10, blank=True, null=True)
    direccion_comuna = models.CharField(max_length=100, blank=True, null=True)
    
    # Contacto de emergencia
    contacto_emergencia_nombre = models.CharField(max_length=150, blank=True, null=True)
    contacto_emergencia_codigo = models.CharField(max_length=5, default="+56", blank=True)
    contacto_emergencia_telefono = models.CharField(max_length=17, blank=True, null=True)
    
    # Notas y alergias (solo para clientes)
    notas_especiales = models.TextField(max_length=200, blank=True, null=True)
    alergias = models.TextField(max_length=150, blank=True, null=True)
    
    # ========== CAMPOS NUEVOS PARA PERFIL COMERCIO ==========
    rubro = models.CharField(max_length=50, blank=True, null=True)  # PELUQUERIA, etc.
    descripcion_comercio = models.TextField(max_length=200, blank=True, null=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nombre", "apellidos"]
    
    objects = UserManager()
    
    def __str__(self):
        return self.email
    
    @property
    def get_full_name(self):
        return f"{self.nombre} {self.apellidos}"
    
    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }
    
    def perfil_comercio_completo(self):
        """Verifica si el comercio ha completado su perfil"""
        if not self.is_staff:
            return True  # Los clientes no necesitan perfil comercio
        
        # Verificar campos obligatorios del comercio
        campos_obligatorios = [
            self.telefono,
            self.rubro,
            self.direccion_calle,
            self.direccion_comuna,
        ]
        
        return all(campo not in [None, ""] for campo in campos_obligatorios)

class OneTimePassword(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)  # ✅ NUEVO
    
    def __str__(self):
        return f"{self.user.email}-{self.code}"
    
    def is_valid(self):
        """Verifica si el código aún es válido (5 minutos)"""
        return (timezone.now() - self.created_at) < timedelta(minutes=5)
