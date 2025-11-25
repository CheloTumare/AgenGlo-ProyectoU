import { X } from 'lucide-react';

const ServicioModal = ({ isOpen, formData, tipos, onClose, onChange, onSubmit, cargando, editando }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{editando ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <form className="p-6 space-y-4" onSubmit={onSubmit}>
          {[
            { label: 'Nombre del Servicio *', name: 'nombre_servicio', type: 'text', placeholder: 'Ej: Corte de cabello' },
            { label: 'Duración *', name: 'duracion', type: 'time' },
            { label: 'Precio (CLP) *', name: 'precio', type: 'number', min: 1000, max: 1000000, placeholder: '15000' }
          ].map(({ label, ...rest }) => (
            <div key={rest.name}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                {...rest}
                value={formData[rest.name]}
                onChange={onChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Servicio *</label>
            <select
              name="tipo_servicio"
              value={formData.tipo_servicio}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar tipo</option>
              {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={onChange}
              rows="3"
              placeholder="Describe tu servicio..."
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-md text-gray-700" disabled={cargando}>Cancelar</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700" disabled={cargando}>
              {cargando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServicioModal;