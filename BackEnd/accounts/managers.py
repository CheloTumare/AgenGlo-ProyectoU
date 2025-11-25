from django.contrib.auth.models import BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.translation import gettext_lazy as _

# Manager personalizado para el modelo User que maneja creación y validación
class UserManager(BaseUserManager):

    def email_validator(self, email):
        # Valida que el email tenga formato correcto, lanza error personalizado si no
        try:
            validate_email(email)
        except ValidationError:
            raise ValueError(_("INGRESA UN CORREO VÁLIDO"))

    def create_user(self, email, nombre, apellidos, password=None, **extra_fields):
        # Validaciones básicas para campos obligatorios
        if not email:
            raise ValueError(_("Ingrese un Correo Electrónico"))
        if not nombre:
            raise ValueError(_("Ingrese su Nombre"))
        if not apellidos:
            raise ValueError(_("Ingrese sus apellidos"))

        # Normaliza el email (convierte a minúsculas la parte del dominio)
        email = self.normalize_email(email)
        # Valida el email con la función personalizada
        self.email_validator(email)

        # Crea una instancia del usuario con los datos proporcionados y campos extra
        user = self.model(
            email=email,
            nombre=nombre,
            apellidos=apellidos,
            **extra_fields
        )

        # Hashea la contraseña y la asigna
        user.set_password(password)

        # Guarda el usuario en la base de datos (usando la base configurada)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, nombre, apellidos, password=None, **extra_fields):
        # Establece los campos obligatorios para un superusuario
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_verified", True)  # Marca el superusuario como verificado automáticamente

        # Valida que los campos estén correctamente configurados
        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("is_staff debe ser True para el usuario administrador"))

        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("is_superuser debe ser verdadero para el usuario administrador"))

        # Llama al método create_user con los datos proporcionados para crear el superusuario
        return self.create_user(
            email=email,
            nombre=nombre,
            apellidos=apellidos,
            password=password,
            **extra_fields
        )