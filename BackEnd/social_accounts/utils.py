from google.auth.transport import requests
from google.oauth2 import id_token
from accounts.models import User
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed


class Google():
    @staticmethod
    def validate(access_token):
        try:
            id_info = id_token.verify_oauth2_token(access_token, requests.Request())
            if "accounts.google.com" in id_info['iss']:
                return id_info
        except Exception as e:
            return "Token invalido o expirado"
        

def login_social_user(email,password):
    user=authenticate(email=email,password=password)
    user_tokens = user.tokens()
    print(user.id)
    return {
        'id': user.id,
        'email':user.email,
        'full_name':user.get_full_name,
        'access_token':str(user_tokens.get('access')),
        'refresh_token':str(user_tokens.get('refresh')),
        'is_staff':user.is_staff
    }

def register_social_user(provider,email, nombre,apellidos):
    user=User.objects.filter(email=email)
    if user.exists():
        if provider == user[0].auth_provider:
            result=login_social_user(email,settings.SOCIAL_AUTH_PASSWORD)
            return result
        else:
            raise AuthenticationFailed(
                detail=f'Por favor continua tu login con {user[0].auth_provider}'
            )
    else:
        new_user={
            'email':email,
            'nombre':nombre,
            'apellidos':apellidos,
            'password':settings.SOCIAL_AUTH_PASSWORD
        }
        register_user=User.objects.create_user(**new_user)
        register_user.auth_provider=provider
        register_user.is_verified=True
        register_user.save()
        result = login_social_user(email=register_user.email, password=settings.SOCIAL_AUTH_PASSWORD)
        return result