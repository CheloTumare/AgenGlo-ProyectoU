from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, date
from .models import Servicio,Disponibilidad,Cita
from .serializers import (
    ServicioSerializer, ServicioCreateUpdateSerializer,
    DisponibilidadSerializer,CitaSerializer,
    CitaCreateUpdateSerializer,CitaListSerializer,
    ComercioSerializer, ComercioDetalleSerializer,
)
from .permissions import EsCliente, EsProveedor #Permisos creados por nosotros
from accounts.models import User

# Create your views here.

class ServicioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar servicios
    - GET /servicios/ : Lista todos los servicios (cualquier usuario autenticado)
    - POST /servicios/ : Crear nuevo servicio (solo proveedores)
    - GET /servicios/{id}/ : Detalle de servicio (cualquier usuario autenticado)
    - PUT /servicios/{id}/ : Actualizar servicio (solo el proveedor dueño)
    - DELETE /servicios/{id}/ : Eliminar servicio (solo el proveedor dueño)
    """
    queryset = Servicio.objects.all()

    def get_permissions(self):
        """ Permisos dinámicos según la acción """
        if self.action in ['create','mis_servicios']:
            permission_classes = [EsProveedor]
        elif self.action in ['update','partial_update','destroy']:
            permission_classes = [EsProveedor]
        else:
            permission_classes = [permissions.IsAuthenticated]
            
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """ Elige el serializer a utilizar dependiendo de la accion que se esta ejecutando """
        if self.action in ['create','update','partial_update']:
            return ServicioCreateUpdateSerializer
        return ServicioSerializer
    
    def get_queryset(self):
        queryset = Servicio.objects.select_related('proveedor')
        
        # Para update/delete, solo permitir servicios del proveedor actual
        if self.action in ['update','partial_update','destroy']:
            queryset = queryset.filter(proveedor=self.request.user)
            
        # Filtros opcionales
        proveedor_id = self.request.query_params.get('proveedor', None)
        tipo_servicio = self.request.query_params.get('tipo', None)
        precio_min = self.request.query_params.get('precio_min', None)
        precio_max = self.request.query_params.get('precio_max', None)
        
        if proveedor_id:
            if proveedor_id == 'mis_servicios':
                queryset = queryset.filter(proveedor=self.request.user)
            else:
                queryset = queryset.filter(proveedor_id=proveedor_id)
        if tipo_servicio:
            queryset = queryset.filter(tipo_servicio=tipo_servicio)
        if precio_min:
            queryset = queryset.filter(precio__gte=precio_min)
        if precio_max:
            queryset = queryset.filter(precio__lte=precio_max)
            
        return queryset
    
    def perform_create(self, serializer):
        # Con JWT ya sabemos que el usuario esta autenticado
        if self.request.user.is_staff:
            serializer.save(proveedor=self.request.user)
        else:
            serializer.save()
            
        
    @action(detail=False, methods=['get'])
    def mis_servicios(self,request):
        """Endpoint: GET /servicios/mis_servicios/ - Solo proveedores"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Solo los proveedores pueden ver sus servicios'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        servicios = self.get_queryset().filter(proveedor=request.user).select_related('proveedor')
        serializer = self.get_serializer(servicios, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def tipos_servicio(self, request):
        """Endpoint: GET /servicios/tipos_servicio/"""
        from .choices import TIPOS_SERVICIO
        return Response([{'value': key, 'label': value} for key, value in TIPOS_SERVICIO])
    
class DisponibilidadViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar disponibilidades
    - GET /disponibilidades/ : Lista disponibilidades (cualquier usuario autenticado)
    - POST /disponibilidades/ : Crear disponibilidad (solo proveedores)
    - GET /disponibilidades/{id}/ : Detalle de disponibilidad
    - PUT /disponibilidades/{id}/ : Actualizar disponibilidad (solo el proveedor dueño)
    - DELETE /disponibilidades/{id}/ : Eliminar disponibilidad (solo el proveedor dueño)
    """
    queryset = Disponibilidad.objects.all()
    serializer_class = DisponibilidadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'mis_disponibilidades']:
            permission_classes = [EsProveedor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [perm() for perm in permission_classes]
    
    def get_queryset(self):
        queryset = Disponibilidad.objects.select_related('proveedor')
            
        # Filtros opcionales
        proveedor_id = self.request.query_params.get('proveedor', None)
        fecha = self.request.query_params.get('fecha', None)
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)
        
        if proveedor_id:
            queryset = queryset.filter(proveedor_id=proveedor_id)
        if fecha:
            queryset = queryset.filter(fecha=fecha)
        if fecha_desde:
            queryset = queryset.filter(fecha__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha__lte=fecha_hasta)
        
        return queryset.order_by('fecha','hora_inicio')
    
    def perform_create(self, serializer):
        # Con JWT ya sabemos que el usuario esta autenticado
        serializer.save(proveedor=self.request.user)
        
    @action(detail=False, methods=['get'])
    def mis_disponibilidades(self, request):
        """Endpoint: GET /disponibilidades/mis_disponibilidades/ - Solo proveedores"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Solo los proveedores pueden ver sus disponibilidades'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        
        if not fecha_desde or not fecha_hasta:
            return Response({'error': 'Debe enviar fecha_desde y fecha_hasta'},status=400)
        
        try:
            disponibilidades = self.get_queryset().filter(proveedor = request.user).select_related('proveedor')
            serializer = self.get_serializer(disponibilidades, many=True)
            return Response(serializer.data)
        except Exception as e:
            print("Error en mis_disponibilidades:", str(e))
            return Response({'error': str(e)}, status=500)
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """
        Endpoint: GET /disponibilidades/disponibles/
        Devuelve solo disponibilidades con cupos libres
        """
        queryset = self.get_queryset()
        disponibles = []
        
        for disp in queryset:
            serializer = self.get_serializer(disp)
            if serializer.data['cupos_disponibles'] > 0:
                disponibles.append(serializer.data)
                
        return Response(disponibles)
    
class CitaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar citas
    - GET /citas/ : Lista citas (proveedores ven sus citas, clientes ven sus citas)
    - POST /citas/ : Crear cita (solo clientes)
    - GET /citas/{id}/ : Detalle de cita (solo si eres dueño)
    - PUT /citas/{id}/ : Actualizar cita (solo clientes de sus propias citas)
    - DELETE /citas/{id}/ : Eliminar cita (solo clientes de sus propias citas)
    """
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CitaListSerializer
        elif self.action in ['create','update','partial_update']:
            return CitaCreateUpdateSerializer
        return CitaSerializer
    
    def get_queryset(self):
        queryset = Cita.objects.select_related('cliente','servicio','servicio__proveedor')
                
        # Filtros opcionales
        cliente_id = self.request.query_params.get('cliente', None)
        proveedor_id = self.request.query_params.get('proveedor', None)
        estado = self.request.query_params.get('estado',None) 
        fecha = self.request.query_params.get('fecha',None)
        fecha_desde = self.request.query_params.get('fecha_desde',None)
        fecha_hasta = self.request.query_params.get('fecha_hasta',None)
        
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        if proveedor_id:
            queryset = queryset.filter(servicio__proveedor_id=proveedor_id)
        if estado:
            queryset = queryset.filter(estado=estado)    
        if fecha:
            queryset = queryset.filter(fecha=fecha)
        if fecha_desde:
            queryset = queryset.filter(fecha__gte=fecha_desde)    
        if fecha_hasta:
            queryset = queryset.filter(fecha__lte=fecha_hasta)
            
        return queryset.order_by('-fecha','-hora')
    
    def perform_create(self, serializer):
        # Con JWT ya sabemos que el usuario esta autenticado
        if not self.request.user.is_staff:
            serializer.save(cliente=self.request.user)
        else:
            serializer.save()
            
        
    @action(detail=False, methods=['get'])
    def mis_citas(self,request):
        """Endpoint: GET /citas/mis_citas/"""
        if request.user.is_staff:
            citas = self.get_queryset().filter(servicio__proveedor=request.user)
        else:
            citas = self.get_queryset().filter(cliente=request.user)
        
        serializer = self.get_serializer(citas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def cambiar_estado(self, request,pk=None):
        """
        Endpoint: PATCH /citas/{id}/cambiar_estado/
        Body: {"estado": "confirmada"}
        Solo proveedores pueden confirmar, solo clientes pueden cancelar sus citas
        """
        cita = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        if not nuevo_estado:
            return Response(
                {'error':'El estado es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Validar permisos según rol
        if request.user.is_staff:
            # Proveedores pueden cambiar estado de citas de sus servicios
            if cita.servicio.proveedor != request.user:
                return Response(
                    {'error': 'No puedes cambiar el estado de esta cita'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            # Clientes solo pueden cancelar sus propias citas
            if cita.cliente != request.user:
                return Response(
                    {'error': 'No puedes cambiar el estado de esta cita'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            if nuevo_estado != 'cancelada':
                return Response(
                    {'error': 'Solo puedes cancelar tus citas'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        cita.estado = nuevo_estado
        cita.save()
        
        serializer = self.get_serializer(cita)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def proximas(self, request):
        """Endpoint: GET /citas/proximas/"""
        hoy = timezone.now().date()
        
        # get_queryset ya filtra según el usuario
        if request.user.is_staff:
            citas = self.get_queryset().filter(
                servicio__proveedor=request.user,
                fecha__gte=hoy,
                estado__in=['pendiente', 'confirmada']
            )
        else:
            citas = self.get_queryset().filter(
                cliente=request.user,
                fecha__gte=hoy,
                estado__in=['pendiente', 'confirmada']
            )
        serializer = self.get_serializer(citas[:10], many=True)  # Límite de 10
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def estados(self, request):
        """Endpoint: GET /citas/estados/"""
        from .choices import Estado_Cita
        return Response([{'value': key, 'label': value} for key, value in Estado_Cita])
    
class ComercioListView(generics.ListAPIView):
    """
    Lista todos los comercios (usuarios con is_staff=True)
    """
    serializer_class = ComercioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = User.objects.filter(is_staff=True, is_active=True)
        
        # Filtro por rubro
        rubro = self.request.query_params.get('rubro', None)
        if rubro:
            queryset = queryset.filter(rubro__icontains=rubro)
        
        # Búsqueda por nombre o descripción
        search = self.request.query_params.get('search', None)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(apellidos__icontains=search) |
                Q(rubro__icontains=search) |
                Q(descripcion_comercio__icontains=search)
            )
        
        return queryset.order_by('nombre')


class ComercioDetalleView(generics.RetrieveAPIView):
    """
    Obtiene el detalle de un comercio específico con sus servicios
    """
    serializer_class = ComercioDetalleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.filter(is_staff=True, is_active=True)


class ComercioDisponibilidadView(generics.ListAPIView):
    """
    Obtiene la disponibilidad de un comercio específico
    """
    serializer_class = DisponibilidadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        comercio_id = self.kwargs.get('comercio_id')
        queryset = Disponibilidad.objects.filter(proveedor_id=comercio_id)
        
        # Filtros de fecha
        fecha = self.request.query_params.get('fecha', None)
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)
        
        if fecha:
            queryset = queryset.filter(fecha=fecha)
        if fecha_desde:
            queryset = queryset.filter(fecha__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha__lte=fecha_hasta)
        
        return queryset.order_by('fecha', 'hora_inicio')