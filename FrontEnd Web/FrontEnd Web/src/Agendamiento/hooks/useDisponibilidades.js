import { useState } from 'react';
import { useAPI } from './useAPI';
import { toast } from 'react-toastify';

export const useDisponibilidades = () => {
  const { apiCall } = useAPI();
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarDisponibilidadesPorPeriodo = async (fechaDesde, fechaHasta) => {
    setLoading(true);
    try {
      const formatDate = (fecha) => fecha.toISOString().split('T')[0];
      const params = {
      fecha_desde: formatDate(fechaDesde),
      fecha_hasta: formatDate(fechaHasta)
    };
      const data = await apiCall(`/disponibilidades/mis_disponibilidades/`,{
        params
      });
      setDisponibilidades(data || []);
    } catch (error) {
      console.error('Error al cargar disponibilidades:', error);
      setDisponibilidades([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarDisponibilidades = async (proveedorId) => {
    setLoading(true);
    try {
      const hoy = new Date().toISOString().split('T')[0];

      const data = await apiCall(`/disponibilidades/`, {
        params: { proveedor: proveedorId,
          fecha_desde:hoy
         }
      });
      
      setDisponibilidades(data || []);
    } catch (error) {
      console.error('Error al cargar disponibilidades del proveedor:', error);
      setDisponibilidades([]);
    } finally {
      setLoading(false);
    }
  };

  const crearDisponibilidad = async (datos) => {
    try {
      const respuesta = apiCall('/disponibilidades/', {
        method: 'post',
        data: datos
      });
      return { success: true, data: respuesta };
    } catch (error) {
      console.error('Error creando disponibilidad: ', error);
      toast.error(`Error: ${error.message}`);
      return {success: false, error: error.message}
    }
  };

  const actualizarDisponibilidad = async (id, datos) => {
    return apiCall(`/disponibilidades/${id}/`, {
      method: 'put',
      data: datos
    });
  };

  const eliminarDisponibilidad = async (id) => {
    return apiCall(`/disponibilidades/${id}/`, {
      method: 'delete'
    });
  };

  return {
    disponibilidades,
    loading,
    cargarDisponibilidadesPorPeriodo,
    crearDisponibilidad,
    actualizarDisponibilidad,
    eliminarDisponibilidad,
    cargarDisponibilidades
  };
};