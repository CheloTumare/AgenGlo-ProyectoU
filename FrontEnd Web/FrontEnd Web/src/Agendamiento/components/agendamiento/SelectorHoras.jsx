import React from 'react';
import EmptyState from '../ui/EmptyState';
import { Clock } from 'lucide-react';

const SelectorHoras = ({ disponibilidades, fechaSeleccionada, horaSeleccionada, onHoraChange }) => {
  const horasDisponibles = disponibilidades.filter(d => d.fecha === fechaSeleccionada);

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Selecciona una hora</h3>
      {fechaSeleccionada ? (
        <div className="grid grid-cols-2 gap-2">
          {horasDisponibles.map(disp => (
            <button
              key={disp.id}
              onClick={() => onHoraChange(disp.hora_inicio)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                horaSeleccionada === disp.hora_inicio
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{disp.hora_inicio}</div>
              <div className="text-xs text-gray-500">
                {disp.cupos_disponibles} cupos
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title="Primero selecciona una fecha"
          description="Elige una fecha para ver los horarios disponibles"
        />
      )}
    </div>
  );
};

export default SelectorHoras;