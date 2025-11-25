import React from 'react';
import {
  CheckCircle, XCircle, AlertCircle, Clock3
} from 'lucide-react';

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock3 className="w-5 h-5 text-yellow-500" /> },
  { value: 'confirmada', label: 'Confirmada', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
  { value: 'completada', label: 'Completada', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-5 h-5 text-blue-500" /> },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-5 h-5 text-red-500" /> },
  { value: 'no_asistio', label: 'No Asistió', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-5 h-5 text-gray-500" /> },
];

const EstadisticasCitas = ({ citas }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {ESTADOS.map(estado => {
        const count = citas.filter(cita => cita.estado === estado.value).length;
        return (
          <div key={estado.value} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{estado.label}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              <div className={`p-2 rounded-full ${estado.color}`}>
                {estado.icon}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EstadisticasCitas;