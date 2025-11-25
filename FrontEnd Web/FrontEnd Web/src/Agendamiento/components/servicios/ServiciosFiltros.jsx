import React, { memo } from 'react';
import { Search } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ServiciosFiltros = memo(({ filtros, onFiltrosChange, tiposServicio }) => {
  const handleChange = (key, value) => {
    onFiltrosChange(prevFiltros => ({ ...prevFiltros, [key]: value }));
  };

  const limpiarFiltros = () => {
    onFiltrosChange({ tipo: '', precio_max: '', search: '' });
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Servicio o proveedor..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtros.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Servicio</label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filtros.tipo || ''}
            onChange={(e) => handleChange('tipo', e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {tiposServicio.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio máximo</label>
          <input
            type="number"
            placeholder="50000"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filtros.precio_max || ''}
            onChange={(e) => handleChange('precio_max', e.target.value)}
          />
        </div>
        
        <div className="flex items-end">
          <Button variant="outline" onClick={limpiarFiltros} className="w-full">
            Limpiar filtros
          </Button>
        </div>
      </div>
    </Card>
  );
});

ServiciosFiltros.displayName = 'ServiciosFiltros';

export default ServiciosFiltros;