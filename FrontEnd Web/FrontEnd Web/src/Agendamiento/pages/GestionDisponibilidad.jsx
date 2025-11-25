import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDisponibilidades } from '../hooks/useDisponibilidades';
import DisponibilidadNav from '../components/disponibilidad/DisponibilidadNav';
import DisponibilidadCard from '../components/disponibilidad/DisponibilidadCard';
import { AlertCircle, Calendar, CheckCircle, Plus, X } from 'lucide-react';

const GestionDisponibilidad = () => {
  const { user } = useAuth();
  const {
    disponibilidades,
    loading,
    cargarDisponibilidadesPorPeriodo,
    crearDisponibilidad,
    actualizarDisponibilidad,
    eliminarDisponibilidad
  } = useDisponibilidades();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [disponibilidadEditando, setDisponibilidadEditando] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [vistaCalendario, setVistaCalendario] = useState('semana');
  const [formData, setFormData] = useState({ fecha: '', hora_inicio: '', cupos: '1' });

  useEffect(() => {
    if (user && user.is_staff) {
      cargarPorPeriodo();
    }
  }, [fechaSeleccionada, vistaCalendario]);

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  const cargarPorPeriodo = async () => {
    let fechaDesde, fechaHasta;
    if (vistaCalendario === 'semana') {
      const inicioSemana = new Date(fechaSeleccionada);
      inicioSemana.setDate(fechaSeleccionada.getDate() - fechaSeleccionada.getDay());
      fechaDesde = inicioSemana;
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      fechaHasta = finSemana;
    } else {
      fechaDesde = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1);
      fechaHasta = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1, 0);
    }
    await cargarDisponibilidadesPorPeriodo(fechaDesde, fechaHasta);
  };

  const cambiarFecha = (accion) => {
    const nuevaFecha = new Date(fechaSeleccionada);

    if (vistaCalendario === 'semana') {
      nuevaFecha.setDate(nuevaFecha.getDate() + (accion === 'anterior' ? -7 : 7));
    } else {
      nuevaFecha.setMonth(nuevaFecha.getMonth() + (accion === 'anterior' ? -1 : 1));
    }

    setFechaSeleccionada(nuevaFecha);
  };

  const abrirModal = (disp = null) => {
    setDisponibilidadEditando(disp);
    setFormData(disp ? {
      fecha: disp.fecha,
      hora_inicio: disp.hora_inicio.slice(0, 5),
      cupos: disp.cupos.toString()
    } : {
      fecha: new Date().toISOString().split('T')[0],
      hora_inicio: '09:00',
      cupos: '1'
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setDisponibilidadEditando(null);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const guardar = async () => {
    if (!formData.fecha || !formData.hora_inicio || formData.cupos < 1) {
      return mostrarMensaje('error', 'Todos los campos son obligatorios');
    }
    setCargandoAccion(true);
    try {
      const datos = {
        fecha: formData.fecha,
        hora_inicio: `${formData.hora_inicio}:00`,
        cupos: parseInt(formData.cupos)
      };
      if (disponibilidadEditando) {
        await actualizarDisponibilidad(disponibilidadEditando.id, datos);
        mostrarMensaje('success', 'Disponibilidad actualizada');
      } else {
        await crearDisponibilidad(datos);
        mostrarMensaje('success', 'Disponibilidad creada');
      }
      cerrarModal();
      cargarPorPeriodo();
    } catch {
      mostrarMensaje('error', 'Error al guardar');
    } finally {
      setCargandoAccion(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta disponibilidad?')) return;
    setCargandoAccion(true);
    try {
      await eliminarDisponibilidad(id);
      mostrarMensaje('success', 'Eliminada correctamente');
      cargarPorPeriodo();
    } catch {
      mostrarMensaje('error', 'Error al eliminar');
    } finally {
      setCargandoAccion(false);
    }
  };

  const agruparPorFecha = () => {
    const grupos = {};
    disponibilidades.forEach(d => {
      if (!grupos[d.fecha]) grupos[d.fecha] = [];
      grupos[d.fecha].push(d);
    });
    return grupos;
  };

  if (!user || !user.is_staff) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Solo los proveedores pueden acceder a esta sección.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mi Disponibilidad</h1>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Nueva Disponibilidad
        </button>
      </div>

      {mensaje.texto && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          mensaje.tipo === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {mensaje.tipo === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {mensaje.texto}
        </div>
      )}

      <DisponibilidadNav
        vista={vistaCalendario}
        setVista={setVistaCalendario}
        fecha={fechaSeleccionada}
        setFecha={setFechaSeleccionada}
        cambiarFecha={cambiarFecha}
        titulo={vistaCalendario === 'semana'
          ? `Semana del ${fechaSeleccionada.toLocaleDateString('es-CL')}`
          : `${fechaSeleccionada.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`
        }
      />

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {Object.entries(agruparPorFecha()).map(([fecha, items]) => (
            <div key={fecha} className="bg-white rounded-lg shadow border">
              <div className="bg-gray-100 px-6 py-3 border-b font-semibold capitalize">
                {new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(d => (
                  <DisponibilidadCard
                    key={d.id}
                    disponibilidad={d}
                    onEdit={() => abrirModal(d)}
                    onDelete={() => eliminar(d.id)}
                    deshabilitado={cargandoAccion}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {disponibilidadEditando ? 'Editar Disponibilidad' : 'Nueva Disponibilidad'}
              </h2>
              <button onClick={cerrarModal}><X className="w-6 h-6 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} className="w-full border px-3 py-2 rounded" />
              <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleInputChange} className="w-full border px-3 py-2 rounded" />
              <input type="number" name="cupos" value={formData.cupos} onChange={handleInputChange} min="1" max="10" className="w-full border px-3 py-2 rounded" />
              <div className="flex gap-2 pt-4">
                <button onClick={cerrarModal} className="flex-1 border px-4 py-2 rounded">Cancelar</button>
                <button onClick={guardar} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded" disabled={cargandoAccion}>
                  {cargandoAccion ? 'Guardando...' : disponibilidadEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionDisponibilidad;