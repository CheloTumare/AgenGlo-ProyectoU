import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import SelectorFechas from './SelectorFechas';
import SelectorHoras from './SelectorHoras';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ArrowLeft, User, Clock } from 'lucide-react';
import { useDisponibilidades } from '../../hooks/useDisponibilidades';
import { useCitas } from '../../hooks/useCitas';

const ServicioInfo = ({ servicio }) => (
  <Card className="bg-blue-50 p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-2">{servicio.nombre_servicio}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div className="flex items-center text-gray-600">
        <User className="w-4 h-4 mr-2" />
        {servicio.proveedor_nombre}
      </div>
      <div className="flex items-center text-gray-600">
        <Clock className="w-4 h-4 mr-2" />
        {servicio.duracion_formatted}
      </div>
      <div className="flex items-center text-gray-600">
        <span className="font-semibold text-blue-600">{servicio.precio_formatted}</span>
      </div>
    </div>
  </Card>
);

const AgendarCita = ({ servicio, onBack, onSuccess }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [comentario, setComentario] = useState('');
  const [agendando, setAgendando] = useState(false);

  const { disponibilidades, loading, cargarDisponibilidades } = useDisponibilidades();
  const { agendarCita } = useCitas();

  useEffect(() => {
    if (servicio) {
      cargarDisponibilidades(servicio.proveedor_id);
    }
  }, [servicio]);

  const handleFechaChange = (fecha) => {
    setFechaSeleccionada(fecha);
    setHoraSeleccionada('');
  };

  const handleSubmit = async () => {
    if (!fechaSeleccionada || !horaSeleccionada) {
      alert('Por favor selecciona fecha y hora');
      return;
    }

    setAgendando(true);
    const resultado = await agendarCita({
      servicio: servicio.id,
      fecha: fechaSeleccionada,
      hora: horaSeleccionada,
      comentario: comentario
    });

    if (resultado.success) {
      alert('¡Cita agendada exitosamente!');
      onSuccess();
    } else {
      alert('Error al agendar la cita. Intenta nuevamente.');
    }

    setAgendando(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a servicios
        </Button>
      </div>
      <ServicioInfo servicio={servicio} />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SelectorFechas
            disponibilidades={disponibilidades}
            fechaSeleccionada={fechaSeleccionada}
            onFechaChange={handleFechaChange}
          />
          <SelectorHoras
            disponibilidades={disponibilidades}
            fechaSeleccionada={fechaSeleccionada}
            horaSeleccionada={horaSeleccionada}
            onHoraChange={setHoraSeleccionada}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comentario (opcional)
        </label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Alguna información adicional para el proveedor..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!fechaSeleccionada || !horaSeleccionada}
          loading={agendando}
          size="lg"
        >
          Confirmar Cita
        </Button>
      </div>
    </div>
  );
};

export default AgendarCita;