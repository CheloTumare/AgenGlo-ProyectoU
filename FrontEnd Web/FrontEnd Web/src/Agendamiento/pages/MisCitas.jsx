import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAPI } from '../hooks/useAPI';
import { data, Navigate } from 'react-router-dom';
import Filtros from '../components/mis_citas/Filtros';
import CitaCard from '../components/mis_citas/CitaCard';
import ModalCambioEstado from '../components/mis_citas/ModalCambioEstado';


const MisCitas = () => {
  const { user, access } = useAuth()
  const { apiCall } = useAPI();

  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha_desde: '',
    fecha_hasta: ''
  });

  // Estados para el modal de cambio de estado
  const [modalEstado, setModalEstado] = useState({ visible: false, cita: null });

  useEffect(() => {
    const cargarCitas = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`/citas/mis_citas/`,{params:filtros,});
      setCitas(data || []);
    } catch (error) {
      console.error('Error cargando citas:', error);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };
    if (user){
      cargarCitas();
    }
  }, [filtros]);

  const cambiarEstadoCita = async (citaId, nuevoEstado) => {
    try {
      await apiCall(`/citas/${citaId}/cambiar_estado/`, {
        method: 'patch',
        data: { estado: nuevoEstado }
      });
      
      // Actualizar la cita en el estado local
      setCitas(prev => 
        prev.map(c => (c.id === citaId ? {...c,estado:nuevoEstado } : c)) 
      );
      
      setModalEstado({ visible: false, cita: null });
    } catch (error) {
      alert('Error al cambiar el estado de la cita');
    }
  };

  if (!access || !user) return <Navigate to="/login" replace/>

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{user.is_staff ? 'Mis Citas como Proveedor' : 'Mis Citas'}</h1>
      <p className="text-gray-600 mb-6">
        {user.is_staff ? 'Gestiona las citas de tus servicios' : 'Revisa y gestiona tus citas agendadas'}
      </p>

      <Filtros filtros={filtros} setFiltros={setFiltros} />

      {citas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas</h3>
          <p className="text-gray-500">No se encontraron citas con los filtros aplicados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {citas.map(cita => (
            <CitaCard
              key={cita.id}
              cita={cita}
              user={user}
              onConfirm={() => setModalEstado({ visible: true, cita })}
              onCancel={() => cambiarEstadoCita(cita.id, 'cancelada')}
            />
          ))}
        </div>
      )}

      {modalEstado.visible && modalEstado.cita && (
        <ModalCambioEstado
          cita={modalEstado.cita}
          onConfirm={(nuevoEstado) => cambiarEstadoCita(modalEstado.cita.id, nuevoEstado)}
          onClose={() => setModalEstado({ visible: false, cita: null })}
        />
      )}
    </div>
  );
};

export default MisCitas;