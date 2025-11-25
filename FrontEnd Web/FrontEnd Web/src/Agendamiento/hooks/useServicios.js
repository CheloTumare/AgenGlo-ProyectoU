import { useState, useRef, useCallback } from 'react';
import { useAPI } from './useAPI';

export const useServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [loading, setLoading] = useState(false);
  const { apiCall } = useAPI();
  
  // Ref para controlar las peticiones y evitar race conditions
  const abortControllerRef = useRef(null);
  const lastFiltrosRef = useRef('');

  const cargarServicios = useCallback(async (filtros = {}) => {
    // Crear un identificador único para estos filtros
    const filtrosId = JSON.stringify(filtros);
    
    // Si son los mismos filtros que la última vez, no hacer nada
    if (lastFiltrosRef.current === filtrosId) {
      return;
    }
    
    lastFiltrosRef.current = filtrosId;
  
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    
    // Solo mostrar loading si no hay servicios cargados
    const shouldShowLoading = servicios.length === 0;
    
    if (shouldShowLoading) {
      setLoading(true);
    }
    
    try {
      const data = await apiCall(`/servicios/`, {
        params: filtros,
        signal: abortControllerRef.current.signal,
      });
      
      setServicios(data || []);
    } catch (error) {
      // No mostrar error si la petición fue cancelada
      if (error.name !== 'AbortError') {
        console.error('Error cargando servicios:', error);
        setServicios([]);
      }
    } finally {
      if (shouldShowLoading) {
        setLoading(false);
      }
    }
  }, [apiCall, servicios.length]);

  const cargarTiposServicio = useCallback(async () => {
    // Solo cargar si no están ya cargados
    if (tiposServicio.length > 0) return;
    
    try {
      const data = await apiCall('/servicios/tipos_servicio/');
      setTiposServicio(data || []);
    } catch (error) {
      console.error('Error cargando tipos:', error);
      setTiposServicio([]);
    }
  }, [apiCall, tiposServicio.length]);

  return {
    servicios,
    tiposServicio,
    loading,
    cargarServicios,
    cargarTiposServicio
  };
};