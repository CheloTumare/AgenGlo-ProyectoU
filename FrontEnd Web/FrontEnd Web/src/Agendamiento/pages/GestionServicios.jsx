import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, User } from 'lucide-react';
import { useServicios } from '../hooks/useServicios';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../contexts/AuthContext';

import ServicioCard from '../components/gestionServicios/ServicioCard';
import ServicioModal from '../components/gestionServicios/ServicioModal';
import MensajeEstado from '../components/gestionServicios/MensajeEstado';

const GestionServicios = () => {
  const { servicios, tiposServicio, loading, cargarServicios, cargarTiposServicio } = useServicios();
  const { apiCall } = useAPI();
  const { user } = useAuth();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const [formData, setFormData] = useState({
    nombre_servicio: '',
    tipo_servicio: '',
    descripcion: '',
    duracion: '',
    precio: ''
  });

  useEffect(() => {
    if (user) {
      cargarMisServicios();
      cargarTiposServicio();
    }
  }, []);

  const cargarMisServicios = async () => {
    try {
      await cargarServicios({ proveedor: user.email ? 'mis_servicios' : '' });
    } catch {
      mostrarMensaje('error', 'Error al cargar servicios');
    }
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  const abrirModal = (servicio = null) => {
    if (servicio) {
      setServicioEditando(servicio);
      setFormData({
        nombre_servicio: servicio.nombre_servicio,
        tipo_servicio: servicio.tipo_servicio,
        descripcion: servicio.descripcion,
        duracion: formatearDuracionParaInput(servicio.duracion),
        precio: servicio.precio.toString()
      });
    } else {
      setServicioEditando(null);
      setFormData({ nombre_servicio: '', tipo_servicio: '', descripcion: '', duracion: '', precio: '' });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setServicioEditando(null);
    setFormData({ nombre_servicio: '', tipo_servicio: '', descripcion: '', duracion: '', precio: '' });
  };

  const formatearDuracionParaInput = (duracion) => {
    const match = duracion.match(/(\d+)h?\s*(\d+)?m?/);
    const horas = match?.[1] || '0';
    const minutos = match?.[2] || '0';
    return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
  };

  const formatearDuracionParaAPI = (duracionInput) => {
    const [horas, minutos] = duracionInput.split(':');
    return `${horas}:${minutos}:00`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validarFormulario = () => {
    const errores = [];
    if (!formData.nombre_servicio.trim()) errores.push('Nombre requerido');
    if (!formData.tipo_servicio) errores.push('Tipo requerido');
    if (!formData.duracion) errores.push('Duración requerida');
    if (!formData.precio || formData.precio < 1000) errores.push('Precio mínimo $1.000');
    if (formData.precio > 1000000) errores.push('Precio máximo $1.000.000');

    if (errores.length) {
      mostrarMensaje('error', errores.join(', '));
      return false;
    }
    return true;
  };

  const guardarServicio = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setCargandoAccion(true);

    const datos = {
      nombre_servicio: formData.nombre_servicio.trim(),
      tipo_servicio: formData.tipo_servicio,
      descripcion: formData.descripcion.trim(),
      duracion: formatearDuracionParaAPI(formData.duracion),
      precio: parseInt(formData.precio)
    };

    try {
      if (servicioEditando) {
        await apiCall(`/servicios/${servicioEditando.id}/`, {
          method: 'put',
          data: datos
        });
        mostrarMensaje('success', 'Servicio actualizado');
      } else {
        const response = await apiCall('/servicios/', {
          method: 'post',
          data: datos
        });
        console.log(response)
        mostrarMensaje('success', 'Servicio creado');
      }

      cerrarModal();
      cargarMisServicios();
    } catch {
      mostrarMensaje('error', 'Error al guardar el servicio');
    } finally {
      setCargandoAccion(false);
    }
  };

  const eliminarServicio = async (servicio) => {
    if (!window.confirm(`¿Eliminar "${servicio.nombre_servicio}"?`)) return;

    setCargandoAccion(true);
    try {
      await apiCall(`/servicios/${servicio.id}/`, { method: 'delete' });
      mostrarMensaje('success', 'Servicio eliminado');
      cargarMisServicios();
    } catch {
      mostrarMensaje('error', 'Error al eliminar');
    } finally {
      setCargandoAccion(false);
    }
  };

  const getTipoServicioLabel = (tipoValue) => {
    return tiposServicio.find(t => t.value === tipoValue)?.label || tipoValue;
  };

  if (!user?.is_staff) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Servicios</h1>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </button>
      </div>

      <MensajeEstado tipo={mensaje.tipo} texto={mensaje.texto} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {servicios.map(servicio => (
          <ServicioCard
            key={servicio.id}
            servicio={servicio}
            onEdit={abrirModal}
            onDelete={eliminarServicio}
            getTipoLabel={getTipoServicioLabel}
            cargando={cargandoAccion}
          />
        ))}
      </div>

      {servicios.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No tienes servicios registrados</h3>
          <p className="text-gray-600 mb-4">Crea tu primer servicio para recibir citas</p>
          <button onClick={() => abrirModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Crear Servicio
          </button>
        </div>
      )}

      <ServicioModal
        isOpen={modalAbierto}
        formData={formData}
        tipos={tiposServicio}
        onClose={cerrarModal}
        onChange={handleInputChange}
        onSubmit={guardarServicio}
        cargando={cargandoAccion}
        editando={!!servicioEditando}
      />
    </div>
  );
};

export default GestionServicios;