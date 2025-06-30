import React from 'react';

const CardKPI = ({ title, value, description, icon: Icon, color = 'bg-gray-800', textColor = 'text-gray-100' }) => {
  return (
    <div className={`rounded-lg shadow-md p-5 flex flex-col items-center justify-center ${color}`}>
      {Icon && <Icon size={32} className="mb-2 text-red-400" />}
      <div className={`text-2xl font-bold mb-1 ${textColor}`}>{value}</div>
      <div className={`text-sm font-semibold mb-1 ${textColor}`}>{title}</div>
      {description && <div className="text-xs text-gray-400 text-center mt-1">{description}</div>}
    </div>
  );
};

export default CardKPI; 