import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export const useAPI = () => {
    const { access } = useAuth();
    const apiCall = async (endpoint, options = {}) => {
    const url = `http://127.0.0.1:8000/api/v1/agend${endpoint}`;

    const config = {
      url,
      method: options.method || 'get',
      headers: {
        'Authorization': `Bearer ${access}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      data: options.data || null, // Para POST, PUT, PATCH
      params: options.params || null, // Para GET con query params
      signal: options.signal || undefined,
    };

    try {
      const response = await axios(config);
      return response.data || null
    } catch (error){
      console.error('API ERROR:',error);

      // Manejo de error segun axios
      if (error.response){
        // Error del servidor con respuesta
        const msg = error.response.data?.detail || JSON.stringify(error.response.data) || error.message;
        throw new Error(msg);
      } else if (error.request) {
        // La solicitud fue hecha pero no hubo respuesta
        throw new Error('No hubo respuesta del servidor.')
      } else {
        // Algo ocurrio al preparar la solicitud
        throw new Error(error.message)
      }
    }
  };

  return { apiCall };
};