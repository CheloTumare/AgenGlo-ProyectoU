import { AlertCircle, CheckCircle } from 'lucide-react';

const MensajeEstado = ({ tipo, texto }) => {
  if (!texto) return null;

  const estilos = tipo === 'success'
    ? 'bg-green-50 text-green-800 border border-green-200'
    : 'bg-red-50 text-red-800 border border-red-200';

  const Icono = tipo === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${estilos}`}>
      <Icono className="w-5 h-5" />
      {texto}
    </div>
  );
};

export default MensajeEstado;