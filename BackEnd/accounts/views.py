# accounts/views.py
from django.shortcuts import render
from rest_framework.generics import GenericAPIView, RetrieveUpdateAPIView
from .serializers import (
    UserRegisterSerializer, 
    LoginSerializer, 
    PasswordResetRequestSerializer,
    SetNewPasswordSerializer, 
    LogoutUserSerializer,
    ClienteProfileUpdateSerializer,
    ComercioProfileUpdateSerializer,
    UserProfileSerializer
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .utils import send_code_to_user
from .models import OneTimePassword, User
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError
from django.contrib.auth.tokens import PasswordResetTokenGenerator


# Registra usuarios mediante el serializer UserRegisterSerializer
class RegisterUserView(GenericAPIView):
    serializer_class = UserRegisterSerializer
    
    def post(self, request):
        user_data = request.data
        serializer = self.serializer_class(data=user_data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            user = serializer.data
            send_code_to_user(user['email'])
            return Response({
                'data': user,
                'message': f'Hola {user["nombre"]}, gracias por registrarte'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Vista para verificar el correo del usuario mediante un código OTP
class VerifyUserEmail(GenericAPIView):
    
    def post(self, request):
        otpcode = request.data.get('otp')
        try:
            user_code_obj = OneTimePassword.objects.get(code=otpcode)
            user = user_code_obj.user
            if not user.is_verified:
                user.is_verified = True
                user.save()
                return Response({
                    'message': 'Su cuenta ha sido verificada'
                }, status=status.HTTP_200_OK)
            return Response({
                'message': 'Codigo invalido, su cuenta ya está verificada'
            }, status=status.HTTP_204_NO_CONTENT)
            
        except OneTimePassword.DoesNotExist:
            return Response({
                'message': 'Codigo no enviado o no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)


# Vista para iniciar sesión de usuario mediante el LoginSerializer
class LoginUserView(GenericAPIView):
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Vista para solicitar el restablecimiento de contraseña
class PasswordResetRequestView(GenericAPIView):
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, 
            context={'request': request, 'frontend_url': 'http://localhost:5173'}
        )
        serializer.is_valid(raise_exception=True)
        return Response({
            'message': "Enviamos link a tu correo para restablecer tu contraseña"
        }, status=status.HTTP_200_OK)


# Vista que valida el token de recuperación
class PasswordResetConfirm(GenericAPIView):
    def get(self, request, uidb64, token):
        try:
            user_id = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=user_id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({
                    'message': 'Token inválido o ha expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)

            return Response({
                'success': True,
                'message': 'Credenciales válidas',
                'uidb64': uidb64,
                'token': token
            }, status=status.HTTP_200_OK)

        except DjangoUnicodeDecodeError:
            return Response({
                'message': 'Token inválido o ha expirado'
            }, status=status.HTTP_401_UNAUTHORIZED)


# Vista para establecer la nueva contraseña
class SetNewPassword(GenericAPIView):
    serializer_class = SetNewPasswordSerializer

    def patch(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({
            'message': 'Contraseña actualizada correctamente'
        }, status=status.HTTP_200_OK)


# Vista para cerrar sesión
class LogoutUserView(GenericAPIView):
    serializer_class = LogoutUserSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================
# VISTAS PARA PERFIL DE USUARIO
# ============================================

class UserProfileView(RetrieveUpdateAPIView):
    """
    GET: Obtener perfil del usuario autenticado
    PUT/PATCH: Actualizar perfil del usuario autenticado
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Seleccionar serializer según el método y tipo de usuario"""
        if self.request.method == 'GET':
            return UserProfileSerializer
        
        # Para PUT/PATCH, usar serializer según is_staff
        if self.request.user.is_staff:
            return ComercioProfileUpdateSerializer
        return ClienteProfileUpdateSerializer
    
    def get_object(self):
        """Devuelve el usuario autenticado"""
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        """Override para devolver perfil completo después de actualizar"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Devolver con el serializer de perfil completo (incluyendo perfil_completo)
        profile_serializer = UserProfileSerializer(instance)
        return Response(profile_serializer.data)
