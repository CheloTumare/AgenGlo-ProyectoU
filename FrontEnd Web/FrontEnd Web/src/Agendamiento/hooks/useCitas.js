import { useAPI } from './useAPI';

export const useCitas = () => {
  const { apiCall } = useAPI();

  const agendarCita = async (datoCita) => {
    try {
      await apiCall('/citas/', {
        method: 'post',
        data: datoCita
      });
      return { success: true };
    } catch (error) {
      console.error('Error agendando cita:', error);
      return { success: false, error: error.message };
    }
  };

  const obtenerMisCitas = async (filtros = {}) => {
    try {
      const { estado, fecha_desde, fecha_hasta } = filtros;
      const data = await apiCall('/citas/mis_citas', {
        params: { estado, fecha_desde, fecha_hasta }
      });
      return { success: true, data };
    } catch (error) {
      console.error('Error obteniendo citas:', error);
      return { success: false, error: error.message };
    }
  };

  const cambiarEstadoCita = async (citaId, nuevoEstado, comentario = '') => {
    try {
      const body = { estado: nuevoEstado };
      if (comentario) body.comentario = comentario;

      await apiCall(`/citas/${citaId}/cambiar_estado/`, {
        method: 'patch',
        data: body
      });

      return { success: true };
    } catch (error) {
      console.error('Error cambiando estado:', error);
      return { success: false, error: error.message };
    }
  };

  return { agendarCita, obtenerMisCitas, cambiarEstadoCita};
};