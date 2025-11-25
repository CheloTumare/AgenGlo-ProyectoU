from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import smart_str, smart_bytes, force_str
from django.urls import reverse
from .utils import send_normal_email
from rest_framework_simplejwt.tokens import RefreshToken, TokenError


# Serializer para registrar nuevos usuarios
class UserRegisterSerializer(serializers.ModelSerializer):
    # Campos de contraseña. Solo escritura, no se devuelven al cliente.
    password = serializers.CharField(max_length=68, min_length=6, write_only=True)
    password2 = serializers.CharField(max_length=68, min_length=6, write_only=True)  # Confirmación de contraseña

    class Meta:
        model = User  # Modelo al que está vinculado este serializer
        fields = ['email', 'nombre', 'apellidos', 'password', 'password2']  # Campos requeridos en el registro

    def validate(self, attrs):
        # Obtiene ambas contraseñas del diccionario de atributos
        password = attrs.get('password', '')
        password2 = attrs.get('password2', '')

        # Verifica que ambas contraseñas coincidan
        if password != password2:
            raise serializers.ValidationError("Las contraseñas no coinciden")

        return attrs  # Retorna los datos si son válidos

    def create(self, validated_data):
        # Crea un nuevo usuario con los datos validados
        user = User.objects.create_user(
            email=validated_data['email'],
            nombre=validated_data.get('nombre'),
            apellidos=validated_data.get('apellidos'),
            password=validated_data.get('password'),  # `create_user` ya se encarga de hashear la contraseña
        )
        return user
    
# Serializer para iniciar sesión de usuario y devolver sus tokens y datos principales
class LoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255, min_length=6)  # Campo obligatorio para autenticar
    password = serializers.CharField(max_length=68, write_only=True)  # Campo de contraseña (solo entrada, no se devuelve)
    full_name = serializers.CharField(max_length=255, read_only=True)  # Nombre completo del usuario (solo lectura)
    access_token = serializers.CharField(max_length=255, read_only=True)  # Token de acceso (solo salida)
    refresh_token = serializers.CharField(max_length=255, read_only=True)  # Token de refresco (solo salida)

    class Meta:
        model = User  # Modelo de usuario personalizado
        fields = ['id','email', 'password', 'full_name', 'access_token', 'refresh_token', 'is_staff']  # Campos que se procesan
        write_only_fields = ['id']

    def validate(self, attrs):
        email = attrs.get('email')  # Extrae el email desde los datos validados
        password = attrs.get('password')  # Extrae la contraseña

        request = self.context.get('request')  # Obtiene el request del contexto (útil si usas sesiones)

        # Autentica al usuario usando email y contraseña
        user = authenticate(request, email=email, password=password)

        if not user:
            raise AuthenticationFailed("Las credenciales no son válidas, inténtalo de nuevo")  # Error si falla la autenticación

        user_tokens = user.tokens()  # Se asume que el modelo `User` tiene un método `tokens()` para obtener access y refresh
        print(user.id)
        return {
            'id' : user.id,
            'email': user.email,
            'full_name': user.get_full_name,
            'access_token': str(user_tokens.get('access')),
            'refresh_token': str(user_tokens.get('refresh')),
            'is_staff': user.is_staff  # Indica si el usuario tiene permisos administrativos
        }
        
# Serializer para manejar la solicitud de restablecimiento de contraseña mediante email
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)  # Campo de entrada: el correo del usuario que desea recuperar su contraseña

    class Meta:
        fields = ['email']  # NOTA: Esto no tiene efecto aquí porque no es un ModelSerializer

    def validate(self, attrs):
        email = attrs.get('email')  # Obtiene el email desde los datos del request

        if User.objects.filter(email=email).exists():  # Verifica si existe un usuario con ese correo
            user = User.objects.get(email=email)  # Obtiene el objeto de usuario

            # Genera el UID codificado en base64 (para enviar en el enlace)
            uidb64 = urlsafe_base64_encode(smart_bytes(user.id))

            # Genera el token de restablecimiento de contraseña
            token = PasswordResetTokenGenerator().make_token(user)

            # Obtiene el dominio del sitio desde el contexto de la request
            request = self.context.get('request')
            site_domain = get_current_site(request).domain

            # Obtiene la URL del frontend desde el contexto (pasada manualmente)
            frontend_url = self.context.get('frontend_url')

            # Construye la ruta relativa al backend (para generar la URL final)
            relative_link = reverse('password-reset-confirm', kwargs={'uidb64': uidb64, 'token': token})

            # Construye el enlace completo combinando el frontend y la ruta
            abslink = f"{frontend_url}{relative_link}"

            # Cuerpo del correo electrónico
            email_body = f"Hi, use the link below to reset your password:\n{abslink}"

            # Datos del correo a enviar
            data = {
                'email_body': email_body,
                'email_subject': 'Cambia tu Contraseña',
                'to_email': user.email
            }

            # Envía el correo
            send_normal_email(data)

        # Llama a la validación del serializer base (aunque no tiene más validaciones propias)
        return super().validate(attrs)
    
# Serializer para establecer la nueva contraseña tras validar token y usuario
class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=100, min_length=6, write_only=True)  # Nueva contraseña (entrada)
    confirm_password = serializers.CharField(max_length=100, min_length=6, write_only=True)  # Confirmación de contraseña (entrada)
    uidb64 = serializers.CharField(write_only=True)  # UID codificado en base64 (entrada)
    token = serializers.CharField(write_only=True)  # Token para validar el cambio (entrada)

    class Meta:
        fields = ["password", "confirm_password", "uidb64", "token"]  # NOTA: No tiene efecto en serializers.Serializer

    def validate(self, attrs):
        try:
            # Extrae los datos recibidos
            token = attrs.get('token')
            uidb64 = attrs.get('uidb64')
            password = attrs.get('password')
            confirm_password = attrs.get('confirm_password')

            # Decodifica el UID para obtener el id del usuario
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=user_id)  # Obtiene el usuario

            # Verifica que el token sea válido y no haya expirado
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise AuthenticationFailed("Link inválido o ha expirado", 401)

            # Valida que las contraseñas coincidan
            if password != confirm_password:
                raise AuthenticationFailed("Las contraseñas no coinciden")

            # Establece la nueva contraseña y guarda el usuario
            user.set_password(password)
            user.save()

            return user  # Retorna el usuario (importante para que el flujo continúe)

        except Exception as e:
            # En caso de cualquier excepción, se lanza error de autenticación
            raise AuthenticationFailed("Link inválido o ha expirado")
        
# Serializer para manejar el logout, invalidando el refresh token
class LogoutUserSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()  # Token de refresco que se recibirá para invalidar

    # Mensajes de error personalizados para el serializer
    default_error_message = {
        'bad_token': 'Token inválido o expirado'  # Mensaje para token inválido o expirado
    }

    def validate(self, attrs):
        # Obtiene el refresh token enviado en la solicitud
        self.token = attrs.get('refresh_token')
        return attrs  # Devuelve los datos validados (sin modificaciones)

    def save(self, **kwargs):
        try:
            # Convierte el token de texto a un objeto RefreshToken para manejarlo
            token = RefreshToken(self.token)
            # Agrega el token a la blacklist para invalidarlo
            token.blacklist()
        except TokenError:
            # Si ocurre un error con el token (inválido, expirado, etc.), lanza error personalizado
            return self.fail('bad_token')
        
# ============================================
# SERIALIZERS PARA ACTUALIZACIÓN DE PERFIL
# ============================================

class ClienteProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar perfil de cliente (usuarios no staff)"""
    
    class Meta:
        model = User
        fields = [
            'codigo_pais', 'telefono', 
            'direccion_calle', 'direccion_numero', 'direccion_comuna',
            'rut',
            'contacto_emergencia_nombre', 'contacto_emergencia_codigo',
            'contacto_emergencia_telefono',
            'notas_especiales', 'alergias'
        ]
        extra_kwargs = {
            'codigo_pais': {'required': False},
            'telefono': {'required': False},
            'direccion_calle': {'required': False},
            'direccion_numero': {'required': False},
            'direccion_comuna': {'required': False},
            'rut': {'required': False},
            'contacto_emergencia_nombre': {'required': False},
            'contacto_emergencia_codigo': {'required': False},
            'contacto_emergencia_telefono': {'required': False},
            'notas_especiales': {'required': False},
            'alergias': {'required': False},
        }
    
    def validate(self, attrs):
        """Validar que el usuario no sea staff"""
        if self.instance and self.instance.is_staff:
            raise serializers.ValidationError("Los usuarios staff no pueden usar este endpoint")
        return attrs


class ComercioProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar perfil de comercio (usuarios staff)"""
    
    class Meta:
        model = User
        fields = [
            'codigo_pais', 'telefono',
            'direccion_calle', 'direccion_numero', 'direccion_comuna',
            'rut', 'rubro', 'descripcion_comercio'
        ]
        extra_kwargs = {
            'codigo_pais': {'required': False},
            'telefono': {'required': False},
            'direccion_calle': {'required': False},
            'direccion_numero': {'required': False},
            'direccion_comuna': {'required': False},
            'rut': {'required': False},
            'rubro': {'required': False},
            'descripcion_comercio': {'required': False},
        }
    
    def validate(self, attrs):
        """Validar que el usuario sea staff"""
        if self.instance and not self.instance.is_staff:
            raise serializers.ValidationError("Solo usuarios comercio pueden usar este endpoint")
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer para obtener (GET) el perfil completo"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    perfil_completo = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'nombre', 'apellidos', 'full_name',
            'codigo_pais', 'telefono',
            'direccion_calle', 'direccion_numero', 'direccion_comuna',
            'rut', 'is_staff',
            # Campos solo para clientes
            'contacto_emergencia_nombre', 'contacto_emergencia_codigo',
            'contacto_emergencia_telefono', 'notas_especiales', 'alergias',
            # Campos solo para comercio
            'rubro', 'descripcion_comercio',
            # Campo calculado
            'perfil_completo'
        ]
        read_only_fields = ['id', 'email', 'nombre', 'apellidos', 'is_staff']
    
    def get_perfil_completo(self, obj):
        """Calcula si el perfil del comercio está completo"""
        if not obj.is_staff:
            return True  # Los clientes no necesitan completar perfil comercio
        
        # Campos obligatorios para comercios
        campos_obligatorios = [
            obj.telefono,
            obj.rubro,
            obj.direccion_calle,
            obj.direccion_comuna,
        ]
        
        # Verifica que todos los campos obligatorios estén completos
        return all(campo not in [None, ""] for campo in campos_obligatorios)

