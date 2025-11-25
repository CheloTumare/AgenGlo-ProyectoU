import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCitas } from '../hooks/useCitas';

import Filtros from '../components/GestionCitasProveedor/Filtros';
import EstadisticasCitas from '../components/GestionCitasProveedor/EstadisticasCitas';
import TablaCitas from '../components/GestionCitasProveedor/TablaCitas';
import ModalCambioEstado from '../components/GestionCitasProveedor/ModalCambioEstado';
import ModalDetalleCita from '../components/GestionCitasProveedor/ModalDetalleCita';

const GestionCitasProveedor = () => {
  const { user } = useAuth();
  const { obtenerMisCitas, cambiarEstadoCita } = useCitas();

  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    busqueda: ''
  });

  const transicionesPermitidas = {
    pendiente: ['confirmada', 'cancelada'],
    confirmada: ['completada', 'cancelada', 'no_asistio'],
    completada: [],
    cancelada: [],
    no_asistio: []
  };

  const [modalCambioEstado, setModalCambioEstado] = useState({ visible: false, cita: null, nuevoEstado: '' });
  const [modalDetalle, setModalDetalle] = useState({ visible: false, cita: null });

  const cargarCitas = async () => {
    setLoading(true);
    const res = await obtenerMisCitas(filtros);
    if (res.success) {
      let citasFiltradas = res.data || [];

      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        citasFiltradas = citasFiltradas.filter(cita =>
          cita.cliente_nombre?.toLowerCase().includes(busqueda) ||
          cita.servicio_nombre?.toLowerCase().includes(busqueda)
        );
      }

      setCitas(citasFiltradas);
    } else {
      setCitas([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.is_staff) {
      cargarCitas();
    }
  }, [filtros, user]);

  if (!user || !user.is_staff) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">Solo los proveedores pueden acceder a esta sección.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Citas</h1>
      <p className="text-gray-600 mb-6">Administra y cambia el estado de las citas de tus servicios</p>

      <Filtros filtros={filtros} setFiltros={setFiltros} />

      <EstadisticasCitas citas={citas} />

      <TablaCitas
        citas={citas}
        loading={loading}
        setModalDetalle={setModalDetalle}
        setModalCambioEstado={setModalCambioEstado}
      />

      <ModalCambioEstado
        modal={modalCambioEstado}
        setModal={setModalCambioEstado}
        cambiarEstadoCita={async (...args) => {
          const res = await cambiarEstadoCita(...args);
          if (res.success) {
            cargarCitas();
          }
        }}
        transiciones={transicionesPermitidas}
      />

      <ModalDetalleCita modal={modalDetalle} setModal={setModalDetalle} />
    </div>
  );
};

export default GestionCitasProveedor;