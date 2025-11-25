import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  className = '',
  ...props 
}) => {
  // Clases base para todos los botones: flex, centrado, fuente, transición, sombra, focus
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-in-out shadow-md focus:outline-none focus:ring-4 focus:ring-offset-2';
  
  // Definición de estilos por variante
  const variants = {
    // Variante principal: Azul
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500/50',
    
    // Variante secundaria: Gris/neutro
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-500/50',
    
    // Variante de contorno (outline): Fondo blanco con borde sutil
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-blue-500/50',

    // Nuevo: Variante de peligro (Ejemplo)
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500/50',
  };
  
  // Definición de tamaños
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg', // Más pequeño, texto más chico
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl' // Más grande, redondeo más notable
  };
  
  // Clases para estados deshabilitado o cargando
  const disabledClasses = disabled || loading 
    ? 'opacity-60 cursor-not-allowed shadow-none' // Sombra eliminada para estado deshabilitado
    : '';
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          {/* Añadir un spinner para mejor UX */}
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;