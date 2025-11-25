import React from 'react';
import { Filter, Search } from 'lucide-react';

const Filtros = ({ filtros, setFiltros }) => {
  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      fecha_desde: '',
      fecha_hasta: '',
      busqueda: ''
    });
  };

  const estados = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'no_asistio', label: 'No Asistió' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-gray-700">Filtros y Búsqueda</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cliente o servicio..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {estados.map(estado => (
              <option key={estado.value} value={estado.value}>{estado.label}</option>
            ))}
          </select>
        </div>

        {/* Fecha desde */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
          <input
            type="date"
            value={filtros.fecha_desde}
            onChange={(e) => setFiltros(prev => ({ ...prev, fecha_desde: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Fecha hasta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
          <input
            type="date"
            value={filtros.fecha_hasta}
            onChange={(e) => setFiltros(prev => ({ ...prev, fecha_hasta: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botón limpiar */}
        <div className="flex items-end">
          <button
            onClick={limpiarFiltros}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filtros;