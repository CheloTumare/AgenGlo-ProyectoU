const ModalCambioEstado = ({ cita, onConfirm, onCancel, onClose }) => {
  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-CL');
  const formatearHora = (hora) => hora.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Cambiar Estado de Cita</h3>
        <div className="mb-4 text-sm text-gray-600">
          <p>Cliente: {cita.cliente_nombre}</p>
          <p>Servicio: {cita.servicio_nombre}</p>
          <p>Fecha: {formatearFecha(cita.fecha)} a las {formatearHora(cita.hora)}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onConfirm('confirmada')} className="flex-1 bg-green-600 text-white py-2 rounded-md">Confirmar</button>
          <button onClick={() => onConfirm('cancelada')} className="flex-1 bg-red-600 text-white py-2 rounded-md">Cancelar</button>
          <button onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalCambioEstado;