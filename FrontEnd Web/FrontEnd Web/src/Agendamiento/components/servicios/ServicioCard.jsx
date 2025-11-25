import React from 'react';
import { User, Clock, MapPin } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ServicioCard = ({ servicio, onSelectService }) => (
  <Card className="hover:shadow-md transition-shadow">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{servicio.nombre_servicio}</h3>
        <span className="text-2xl font-bold text-blue-600">{servicio.precio_formatted}</span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-2" />
          {servicio.proveedor_nombre}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {servicio.duracion_formatted}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {servicio.tipo_servicio_display}
        </div>
      </div>
      
      {servicio.descripcion && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{servicio.descripcion}</p>
      )}
      
      <Button onClick={() => onSelectService(servicio)} className="w-full">
        Agendar Cita
      </Button>
    </div>
  </Card>
);

export default ServicioCard;