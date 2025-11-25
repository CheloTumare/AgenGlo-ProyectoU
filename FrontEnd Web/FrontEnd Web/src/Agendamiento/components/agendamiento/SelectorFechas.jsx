import React from 'react';
import EmptyState from '../ui/EmptyState';
import { Calendar } from 'lucide-react';

const SelectorFechas = ({ disponibilidades, fechaSeleccionada, onFechaChange }) => {
  const disponibilidadesPorFecha = disponibilidades.reduce((acc, disp) => {
    if (!acc[disp.fecha]) acc[disp.fecha] = [];
    acc[disp.fecha].push(disp);
    return acc;
  }, {});

  const fechasDisponibles = Object.keys(disponibilidadesPorFecha).sort();

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Selecciona una fecha</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {fechasDisponibles.map(fecha => {
          const fechaObj = new Date(fecha + 'T00:00:00');
          const fechaFormateada = fechaObj.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          return (
            <button
              key={fecha}
              onClick={() => onFechaChange(fecha)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                fechaSeleccionada === fecha
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium capitalize">{fechaFormateada}</div>
              <div className="text-sm text-gray-500">
                {disponibilidadesPorFecha[fecha].length} horarios disponibles
              </div>
            </button>
          );
        })}
      </div>

      {fechasDisponibles.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No hay fechas disponibles"
          description="Este proveedor no tiene horarios disponibles"
        />
      )}
    </div>
  );
};

export default SelectorFechas;