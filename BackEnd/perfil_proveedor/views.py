from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from .models import PerfilProveedor, SolicitudProveedor
from .serializers import PerfilProveedorSerializer, SolicitudProveedorSerializer

class PerfilProveedorViewSet(viewsets.ModelViewSet):
    queryset = PerfilProveedor.objects.all()
    serializer_class = PerfilProveedorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Solo retorna el perfil del usuario actual (proveedor)
        return PerfilProveedor.objects.filter(usuario=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Asocia el perfil al usuario autenticado
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(usuario=self.request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_update(self, serializer):
        # Garantiza que el usuario no cambie
        serializer.save(usuario=self.request.user)

class CrearSolicitudProveedorView(generics.ListCreateAPIView):
    queryset = SolicitudProveedor.objects.all()
    serializer_class = SolicitudProveedorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Devolver solo solicitudes del usuario autenticado
        return SolicitudProveedor.objects.filter(usuario=self.request.user)
    
    def perform_create(self, serializer):
        # Asociar automáticamente al usuario autenticado
        serializer.save(usuario=self.request.user)

class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser
    
class ActualizarEstadoSolicitudView(generics.UpdateAPIView):
    queryset = SolicitudProveedor.objects.all()
    serializer_class = SolicitudProveedorSerializer
    permission_classes = [IsSuperUser]

    def update(self, request, *args, **kwargs):
        solicitud = self.get_object()
        estado_anterior = solicitud.estado
        response = super().update(request, *args, **kwargs) # Actualiza la solicitud
        solicitud.refresh_from_db() # Recarga la solicitud actualizada

        # Si el estado cambio a 'aprobada', actualizar is_Staff
        if solicitud.estado == 'aprobada' and estado_anterior != 'aprobada':
            user = solicitud.usuario
            user.is_staff = True
            user.save()
        return response
