import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ServiciosFiltros from './ServiciosFiltros';
import ServicioCard from './ServicioCard';
import { useServicios } from '../../hooks/useServicios';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';
import { Search } from 'lucide-react';

// Hook personalizado para debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ServiciosGrid = ({ onSelectService }) => {
  const [filtros, setFiltros] = useState({ tipo: '', precio_max: '', search: '' });
  
  // Debounce solo para el campo de búsqueda para evitar muchas llamadas API
  const debouncedSearch = useDebounce(filtros.search, 500);
  
  const { servicios, tiposServicio, loading, cargarServicios, cargarTiposServicio } = useServicios();

  // Memoizar los filtros finales
  const filtrosFinales = useMemo(() => ({
    tipo: filtros.tipo,
    precio_max: filtros.precio_max,
    search: debouncedSearch
  }), [filtros.tipo, filtros.precio_max, debouncedSearch]);

  // Memoizar la función de cambio de filtros para evitar recrearla
  const handleFiltrosChange = useCallback((newFiltros) => {
    if (typeof newFiltros === 'function') {
      setFiltros(prevFiltros => newFiltros(prevFiltros));
    } else {
      setFiltros(newFiltros);
    }
  }, []);

  // Memoizar la función de selección de servicio
  const handleSelectService = useCallback((servicio) => {
    console.log(servicio)
    onSelectService(servicio);
  }, [onSelectService]);

  // Cargar tipos de servicio una sola vez
  useEffect(() => {
    cargarTiposServicio();
  }, []); // Sin dependencias porque solo se ejecuta una vez

  // Cargar servicios cuando cambien los filtros finales
  useEffect(() => {
    cargarServicios(filtrosFinales);
  }, [filtrosFinales]); // Sin cargarServicios como dependencia

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <ServiciosFiltros 
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        tiposServicio={tiposServicio}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicios.map(servicio => (
          <ServicioCard
            key={servicio.id}
            servicio={servicio}
            onSelectService={handleSelectService}
          />
        ))}
      </div>
      
      {servicios.length === 0 && !loading && (
        <EmptyState
          icon={Search}
          title="No se encontraron servicios"
          description="Intenta ajustar los filtros de búsqueda"
        />
      )}
    </div>
  );
};

export default ServiciosGrid;