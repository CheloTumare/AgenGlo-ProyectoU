from rest_framework import serializers
from .utils import Google,register_social_user
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed


class GoogleSignInSerializer(serializers.Serializer):
    access_token = serializers.CharField(min_length=6)
    
    def validate_access_token(self, access_token):
        google_user_data=Google.validate(access_token)
        try:
            userid=google_user_data['sub']
            
        except:
            raise serializers.ValidationError('Token invalido o expirado')
        
        if google_user_data['aud'] != settings.GOOGLE_CLIENT_ID:
            raise AuthenticationFailed(detail="No se pudo verificar al usuario")
        email=google_user_data['email']
        nombre=google_user_data['given_name']
        apellidos=google_user_data['family_name']
        provider="google"
        return register_social_user(provider,email,nombre,apellidos)