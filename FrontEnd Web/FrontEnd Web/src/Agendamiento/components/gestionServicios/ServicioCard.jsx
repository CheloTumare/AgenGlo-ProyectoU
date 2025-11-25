import { Edit, Trash2, Tag, Clock, DollarSign } from 'lucide-react';

const ServicioCard = ({ servicio, onEdit, onDelete, getTipoLabel, cargando }) => (
  <div className="bg-white rounded-lg shadow-md border p-6">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-semibold">{servicio.nombre_servicio}</h3>
      <div className="flex gap-2">
        <button onClick={() => onEdit(servicio)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar">
          <Edit className="w-5 h-5" />
        </button>
        <button onClick={() => onDelete(servicio)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar" disabled={cargando}>
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>

    <div className="space-y-3 text-gray-600 text-sm">
      <div className="flex items-center gap-2"><Tag className="w-4 h-4" /> {getTipoLabel(servicio.tipo_servicio)}</div>
      <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {servicio.duracion_formatted}</div>
      <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> {servicio.precio_formatted}</div>
    </div>

    {servicio.descripcion && (
      <p className="mt-4 text-gray-600 text-sm line-clamp-3">{servicio.descripcion}</p>
    )}
  </div>
);

export default ServicioCard;