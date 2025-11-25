import { Trash } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ModalCambioEstado = ({ modal, setModal, cambiarEstadoCita, transiciones }) => {
  const navigate = useNavigate()
  const { visible, cita, nuevoEstado } = modal;
  const [comentario, setComentario] = useState('');

  if (!visible || !cita || !transiciones) return null;

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  const formatearHora = (hora) => hora.slice(0, 5);

  const handleConfirmar = () => {
    cambiarEstadoCita(cita.id, nuevoEstado, comentario);
    setModal(false)
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Cambiar Estado de Cita</h3>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">
            <strong>Cliente:</strong> {cita.cliente_nombre}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Servicio:</strong> {cita.servicio_nombre}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Fecha:</strong> {formatearFecha(cita.fecha)} a las {formatearHora(cita.hora)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo Estado</label>
          <select
            value={nuevoEstado}
            onChange={(e) => setModal(prev => ({ ...prev, nuevoEstado: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(transiciones?.[cita.estado] || []).map((estado) => (
              <option key={estado} value={estado}>
                {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Comentario (opcional)</label>
          <textarea
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleConfirmar}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Cambiar Estado
          </button>
          <button
            onClick={() => setModal({ visible: false, cita: null, nuevoEstado: '' })}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCambioEstado;