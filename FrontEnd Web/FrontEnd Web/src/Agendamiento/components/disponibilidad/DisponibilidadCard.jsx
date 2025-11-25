import React from 'react';
import { Clock, Users, Edit, Trash2 } from 'lucide-react';

const DisponibilidadCard = ({ disponibilidad, onEdit, onDelete, cargando }) => {
  const hora = disponibilidad.hora_inicio.slice(0, 5);
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">{hora}</span>
        </div>

        <div className="flex gap-1">
          <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 p-1" title="Editar disponibilidad">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="text-red-600 hover:text-red-800 p-1" title="Eliminar disponibilidad" disabled={cargando}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Users className="w-4 h-4" />
        <span>
          {disponibilidad.cupos_disponibles} de {disponibilidad.cupos} cupos disponibles
        </span>
      </div>

      {disponibilidad.cupos_disponibles === 0 && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          Sin cupos disponibles
        </div>
      )}
    </div>
  );
};

export default DisponibilidadCard;