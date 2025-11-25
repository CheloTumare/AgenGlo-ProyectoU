import React from 'react';
import { Calendar, Clock, User, Eye, Edit3, Clock3, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

const TablaCitas = ({ citas, loading, setModalDetalle, setModalCambioEstado }) => {
  const puedeEditar = (estado) =>
    ['pendiente', 'confirmada'].includes(estado);

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  const formatearHora = (hora) => hora.slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!citas.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas</h3>
        <p className="text-gray-500">No se encontraron citas con los filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {citas.map(cita => (
              <tr key={cita.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{cita.cliente_nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{cita.servicio_nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatearFecha(cita.fecha)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {formatearHora(cita.hora)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {iconoEstado[cita.estado]}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorEstado[cita.estado]}`}>
                      {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalDetalle({ visible: true, cita })}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {puedeEditar(cita.estado) && (
                      <button
                        onClick={() =>
                          setModalCambioEstado({
                            visible: true,
                            cita,
                            nuevoEstado: 'confirmada'
                          })
                        }
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Cambiar estado"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaCitas;