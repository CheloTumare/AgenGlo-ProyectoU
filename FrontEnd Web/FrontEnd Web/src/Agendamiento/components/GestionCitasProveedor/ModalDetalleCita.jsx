import React from 'react';
import { AlertCircle, CheckCircle, Clock3, XCircle } from 'lucide-react';

const iconoEstado = {
  pendiente: <Clock3 className="w-5 h-5 text-yellow-500" />,
  confirmada: <CheckCircle className="w-5 h-5 text-green-500" />,
  completada: <CheckCircle className="w-5 h-5 text-blue-500" />,
  cancelada: <XCircle className="w-5 h-5 text-red-500" />,
  no_asistio: <AlertCircle className="w-5 h-5 text-gray-500" />,
};

const colorEstado = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-green-100 text-green-800',
  completada: 'bg-blue-100 text-blue-800',
  cancelada: 'bg-red-100 text-red-800',
  no_asistio: 'bg-gray-100 text-gray-800',
};

const ModalDetalleCita = ({ modal, setModal }) => {
  const { cita } = modal;

  if (!modal.visible) return null;

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  const formatearHora = (hora) => hora.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">Detalles de la Cita</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Cliente:</span>
              <p className="font-medium">{cita.cliente_nombre}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Estado:</span>
              <div className="flex items-center gap-2 mt-1">
                {iconoEstado[cita.estado]}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorEstado[cita.estado]}`}>
                  {cita.estado.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-sm text-gray-500">Servicio:</span>
            <p className="font-medium">{cita.servicio_nombre}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Fecha:</span>
              <p className="font-medium">{formatearFecha(cita.fecha)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Hora:</span>
              <p className="font-medium">{formatearHora(cita.hora)}</p>
            </div>
          </div>

          {cita.comentario && (
            <div>
              <span className="text-sm text-gray-500">Comentario:</span>
              <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{cita.comentario}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setModal({ visible: false, cita: null })}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleCita;