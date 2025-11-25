import { Filter } from "lucide-react";

const Filtros = ({ filtros, setFiltros }) => {
    return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-gray-700">Filtros</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
          <input
            type="date"
            value={filtros.fecha_desde}
            onChange={(e) => setFiltros(prev => ({ ...prev, fecha_desde: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
          <input
            type="date"
            value={filtros.fecha_hasta}
            onChange={(e) => setFiltros(prev => ({ ...prev, fecha_hasta: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <button
        onClick={() => setFiltros({ estado: '', fecha_desde: '', fecha_hasta: '' })}
        className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
      >
        Limpiar filtros
      </button>
    </div>
    )
};

export default Filtros;