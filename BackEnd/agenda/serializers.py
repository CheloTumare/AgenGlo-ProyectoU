from rest_framework import serializers
from .models import Servicio, Disponibilidad, Cita
from accounts.models import User

class ServicioSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.SerializerMethodField()
    tipo_servicio_display = serializers.CharField(source='get_tipo_servicio_display', read_only=True)
    duracion_formatted = serializers.SerializerMethodField()
    precio_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Servicio
        fields = [
            'id', 'proveedor_nombre',
            'nombre_servicio', 'tipo_servicio', 'tipo_servicio_display',
            'descripcion', 'duracion', 'duracion_formatted',
            'precio', 'precio_formatted', 'proveedor_id'
        ]
        extra_kwargs = {
            'proveedor': {'write_only': True}
        }
    
    def get_proveedor_nombre(self, obj):
        proveedor = getattr(obj, 'proveedor', None)
        if hasattr(proveedor, 'get_full_name'):
            return proveedor.get_full_name
        return str(proveedor) if proveedor else "Sin proveedor"
    
    def get_duracion_formatted(self, obj):
        total_seconds = int(obj.duracion.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        if hours > 0:
            return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
        return f"{minutes}m"
    
    def get_precio_formatted(self, obj):
        return f"${obj.precio:,}".replace(',', '.')


class ServicioCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = [
            'proveedor', 'nombre_servicio', 'tipo_servicio', 
            'descripcion', 'duracion', 'precio'
        ]
        read_only_fields = ['proveedor']

    def validate_proveedor(self, value):
        if not value.is_staff:
            raise serializers.ValidationError("El proveedor debe ser un usuario staff.")
        return value


class DisponibilidadSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.CharField(source='proveedor.get_full_name', read_only=True)
    cupos_disponibles = serializers.SerializerMethodField()

    class Meta:
        model = Disponibilidad
        fields = [
            'id',
            'proveedor',
            'proveedor_nombre',
            'fecha',
            'hora_inicio',
            'cupos',
            'cupos_disponibles'
        ]
        read_only_fields = ['proveedor']

    def get_cupos_disponibles(self, obj):
        from django.db.models import Q
        citas_ocupadas = Cita.objects.filter(
            servicio__proveedor=obj.proveedor,
            fecha=obj.fecha,
            hora=obj.hora_inicio,
            estado__in=['confirmada', 'pendiente']
        ).count()
        return max(0, obj.cupos - citas_ocupadas)

    def validate(self, data):
        proveedor = data.get('proveedor')
        fecha = data.get('fecha')
        hora_inicio = data.get('hora_inicio')
        queryset = Disponibilidad.objects.filter(
            proveedor=proveedor,
            fecha=fecha,
            hora_inicio=hora_inicio
        )
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError(
                "Ya existe una disponibilidad para este proveedor en esta fecha y hora"
            )
        return data

class CitaSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.get_full_name', read_only=True)
    servicio_nombre = serializers.CharField(source='servicio.nombre_servicio', read_only=True)
    servicio = serializers.PrimaryKeyRelatedField(
        queryset=Servicio.objects.all(), write_only=True
    )

    class Meta:
        model = Cita
        fields = [
            'id', 'cliente', 'cliente_nombre',
            'servicio', 'servicio_nombre',
            'fecha', 'hora', 'estado', 'comentario'
        ]
        read_only_fields = ['cliente']

class CitaCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = [
            'servicio', 'fecha',
            'hora', 'estado', 'comentario'
        ]

    def validate_cliente(self, value):
        if value.is_staff:
            raise serializers.ValidationError("El cliente no puede ser un usuario staff.")
        return value

    def validate(self, data):
        servicio = data.get('servicio')
        fecha = data.get('fecha')
        hora = data.get('hora')

        if servicio and fecha and hora:
            disponibilidad = Disponibilidad.objects.filter(
                proveedor=servicio.proveedor,
                fecha=fecha,
                hora_inicio=hora
            ).first()

            if not disponibilidad:
                raise serializers.ValidationError("El proveedor no tiene disponibilidad en la fecha y hora seleccionada")

            citas_existentes = Cita.objects.filter(
                servicio__proveedor=servicio.proveedor,
                fecha=fecha,
                hora=hora,
                estado__in=['pendiente', 'confirmada']
            )

            if self.instance:
                citas_existentes = citas_existentes.exclude(pk=self.instance.pk)

            if citas_existentes.count() >= disponibilidad.cupos:
                raise serializers.ValidationError("Ya no hay cupos disponibles")
        return data

class CitaListSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.get_full_name', read_only=True)
    cliente_email = serializers.SerializerMethodField()
    cliente_telefono = serializers.SerializerMethodField()
    cliente_contacto_emergencia = serializers.SerializerMethodField()
    cliente_alergias = serializers.SerializerMethodField()
    cliente_notas = serializers.SerializerMethodField()
    servicio_nombre = serializers.CharField(source='servicio.nombre_servicio', read_only=True)
    servicio_descripcion = serializers.CharField(source='servicio.descripcion', read_only=True)
    servicio_precio = serializers.SerializerMethodField()
    
    class Meta:
        model = Cita
        fields = [
            'id', 'cliente_nombre', 'cliente_email', 'cliente_telefono', 
            'cliente_contacto_emergencia', 'cliente_alergias', 'cliente_notas',
            'servicio_nombre', 'servicio_descripcion', 'servicio_precio',
            'fecha', 'hora', 'estado', 'comentario'
        ]
        read_only_fields = ['cliente']

    def get_cliente_email(self, obj):
        val = getattr(obj.cliente, 'email', None)
        return val if val not in [None, ""] else "No registrado"

    def get_cliente_telefono(self, obj):
        tel = getattr(obj.cliente, 'telefono', None)
        cod = getattr(obj.cliente, 'codigo_pais', '')
        if tel not in [None, ""]:
            return f"{cod} {tel}".strip()
        return "No registrado"

    def get_cliente_contacto_emergencia(self, obj):
        nombre = getattr(obj.cliente, 'contacto_emergencia_nombre', None)
        telefono = getattr(obj.cliente, 'contacto_emergencia_telefono', None)
        codigo = getattr(obj.cliente, 'contacto_emergencia_codigo', '')
        if nombre not in [None, ""] and telefono not in [None, ""]:
            return f"{nombre} - {codigo} {telefono}"
        return "No registrado"

    def get_cliente_alergias(self, obj):
        val = getattr(obj.cliente, 'alergias', None)
        return val if val not in [None, ""] else None

    def get_cliente_notas(self, obj):
        val = getattr(obj.cliente, 'notas_especiales', None)
        return val if val not in [None, ""] else None

    def get_servicio_precio(self, obj):
        return f"${obj.servicio.precio:,}".replace(',', '.') if obj.servicio and obj.servicio.precio else "No disponible"


class ComercioSerializer(serializers.ModelSerializer):
    """Serializer para listar comercios (usuarios staff con sus datos)"""
    cantidad_servicios = serializers.SerializerMethodField()
    servicios = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'nombre', 'apellidos', 'get_full_name',
            'email', 'telefono', 'codigo_pais',
            'direccion_calle', 'direccion_numero', 'direccion_comuna',
            'rubro', 'descripcion_comercio',
            'cantidad_servicios', 'servicios'
        ]
    
    def get_cantidad_servicios(self, obj):
        return Servicio.objects.filter(proveedor=obj).count()
    
    def get_servicios(self, obj):
        servicios = Servicio.objects.filter(proveedor=obj)
        return ServicioSerializer(servicios, many=True).data


class ComercioDetalleSerializer(serializers.ModelSerializer):
    """Serializer detallado para un comercio específico"""
    servicios = ServicioSerializer(source='servicio_set', many=True, read_only=True)
    cantidad_servicios = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'nombre', 'apellidos', 'get_full_name',
            'email', 'telefono', 'codigo_pais',
            'direccion_calle', 'direccion_numero', 'direccion_comuna',
            'rubro', 'descripcion_comercio',
            'cantidad_servicios', 'servicios'
        ]
    
    def get_cantidad_servicios(self, obj):
        return obj.servicio_set.count()