import React from 'react';

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-12">
    <div className="text-gray-400 mb-4">
      <Icon className="w-12 h-12 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default EmptyState;