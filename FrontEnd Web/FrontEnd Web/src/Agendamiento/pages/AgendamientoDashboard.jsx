import React, { useState,useCallback } from 'react'
import ServiciosGrid from '../components/servicios/ServiciosGrid';
import AgendarCita from '../components/agendamiento/AgendarCita';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AgendamientoDashboard = () => {
  const { user, access } = useAuth()
  if (!access || !user){
    return <Navigate to="/login" replace/>
  }

  const [vistaActual, setVistaActual] = useState('servicios');
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const handleSelectService = useCallback((servicio) => {
    setServicioSeleccionado(servicio);
    setVistaActual('agendar');
  },[]);

  const handleBack = useCallback(() => {
    setVistaActual('servicios');
    setServicioSeleccionado(null);
  },[]);

  const handleSuccess = useCallback(() => {
    setVistaActual('servicios');
    setServicioSeleccionado(null);
  },[]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {vistaActual === 'servicios' ? 'Servicios Disponibles' : 'Agendar Cita'}
          </h1>
          <p className="text-gray-600">
            {vistaActual === 'servicios' 
              ? 'Encuentra y agenda el servicio que necesitas'
              : `Selecciona fecha y hora para ${servicioSeleccionado?.nombre_servicio}`
            }
          </p>
        </div>

        {vistaActual === 'servicios' ? (
          <ServiciosGrid onSelectService={handleSelectService} />
        ) : (
          <AgendarCita
            servicio={servicioSeleccionado}
            onBack={handleBack}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default AgendamientoDashboard;