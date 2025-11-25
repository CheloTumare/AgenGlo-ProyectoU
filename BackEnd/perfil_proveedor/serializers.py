from rest_framework import serializers
from accounts.models import User
from .models import PerfilProveedor, SolicitudProveedor

class PerfilProveedorSerializer(serializers.ModelSerializer):
    usuario = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_staff=True))

    class Meta:
        model = PerfilProveedor
        fields = ['usuario', 'nombre_empresa', 'direccion', 'descripcion_empresa', 'fecha_registro']
        read_only_fields = ['fecha_registro']

    def validate_usuario(self, value):
        if not value.is_staff:
            raise serializers.ValidationError("El usuario debe tener is_staff=True para ser proveedor.")
        return value

    def validate_nombre_empresa(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre de la empresa no puede estar vacío.")
        return value

    def validate_direccion(self, value):
        if not value.strip():
            raise serializers.ValidationError("La dirección no puede estar vacía.")
        return value
    
class SolicitudProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudProveedor
        fields = ['id','usuario','fecha_solicitud','estado','mensaje']
        read_only_fields = ['id','fecha_solicitud','usuario']

    def create(self,validated_data):
        # Asocia el usuario autenticado a la solicitud
        user = self.context['request'].user
        validated_data.pop('usuario', None)
        return SolicitudProveedor.objects.create(usuario=user, **validated_data)