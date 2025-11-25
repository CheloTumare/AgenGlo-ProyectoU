import React from 'react';

const Card = ({ children, className = '' }) => (
  <div 
    // Usamos el color de fondo base Neumórfico (o el color que definas en tu config)
    // El 'p-card-square' de tu CSS original usa #e0e5ec
    className={`bg-[#e0e5ec] rounded-[20px] p-10 neumorphic-shadow ${className}`}
  >
    {children}
  </div>
);

export default Card;