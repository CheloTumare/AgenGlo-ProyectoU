import { Calendar,Clock, User, CheckCircle,XCircle,Clock3 } from "lucide-react";

const getEstadoIcon = (estado) => {
    switch (estado) {
        case 'confirmada': return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'cancelada': return <XCircle className="w-5 h-5 text-red-500" />;
        case 'completada': return <CheckCircle className="w-5 h-5 text-blue-500" />;
        default: return <Clock3 className="w-5 h-5 text-yellow-500" />;
    }
};

const getEstadoColor = (estado) => {
  switch (estado) {
        case 'confirmada': return 'bg-green-100 text-green-800';
        case 'cancelada': return 'bg-red-100 text-red-800';
        case 'completada': return 'bg-blue-100 text-blue-800';
        default: return 'bg-yellow-100 text-yellow-800';
  }
};

const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-CL');
const formatearHora = (hora) => hora.slice(0, 5);

const CitaCard = ({ cita, user, onConfirm, onCancel }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {getEstadoIcon(cita.estado)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
              {cita.estado_display || cita.estado}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-gray-700">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatearFecha(cita.fecha)}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {formatearHora(cita.hora)}</div>
              <div className="flex items-center gap-2"><User className="w-4 h-4" /> {user.is_staff ? cita.cliente_nombre : cita.proveedor_nombre}</div>
            </div>
            <div className="space-y-2">
              <div><span className="text-sm text-gray-500">Servicio:</span> <p className="font-medium">{cita.servicio_nombre}</p></div>
              {!user.is_staff && (
                <div><span className="text-sm text-gray-500">Proveedor:</span> <p>{cita.proveedor_nombre}</p></div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          {user.is_staff && cita.estado === 'pendiente' && (
            <button onClick={onConfirm} className="px-3 py-1 bg-green-600 text-white text-sm rounded-md">Confirmar</button>
          )}
          {!user.is_staff && ['pendiente', 'confirmada'].includes(cita.estado) && (
            <button onClick={onCancel} className="px-3 py-1 bg-red-600 text-white text-sm rounded-md">Cancelar</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitaCard;