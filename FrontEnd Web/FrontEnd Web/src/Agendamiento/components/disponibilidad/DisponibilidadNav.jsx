import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DisponibilidadNav = ({ vista, setVista, cambiarFecha, titulo }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button onClick={() => cambiarFecha('anterior')} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 min-w-[250px] text-center">{titulo}</h2>

        <button onClick={() => cambiarFecha('siguiente')} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setVista('semana')} className={`px-3 py-1 rounded-md text-sm ${vista === 'semana' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Semana
        </button>
        <button onClick={() => setVista('mes')} className={`px-3 py-1 rounded-md text-sm ${vista === 'mes' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Mes
        </button>
      </div>
    </div>
  </div>
);

export default DisponibilidadNav;