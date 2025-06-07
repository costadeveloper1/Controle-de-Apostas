import React from 'react';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  isCompact = false,
  bgColor = 'bg-gray-700', 
  titleColor = 'text-gray-300', 
  valueColor = 'text-white', 
  iconColor = 'text-red-500', 
  textSize = 'text-xs', 
  valueSize = 'text-lg', 
  tooltipText, 
  iconPosition = 'top-center'
}) => {
  if (isCompact) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-400">{React.cloneElement(icon, { size: 18 })}</div>}
          <h4 className="text-gray-300 text-sm font-medium">{title}</h4>
        </div>
        <p className="text-white text-base font-bold">{value}</p>
      </div>
    );
  }

  return (
    <div className={`${bgColor} px-3 py-2 rounded-lg shadow-md flex flex-col items-center text-center relative`}>
      {icon && (
        <div className={`
          ${iconPosition === 'top-center' ? 'flex items-center justify-center w-7 h-7 rounded-full bg-opacity-25 mb-1' : ''}
          ${iconPosition === 'top-right' ? 'absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-opacity-25' : ''}
          ${iconColor}
        `}>
          {tooltipText ? (
            <span title={tooltipText} className="flex items-center justify-center">
              {React.cloneElement(icon, { size: 20, className: iconColor })}
            </span>
          ) : (
            React.cloneElement(icon, { size: 20, className: iconColor })
          )}
        </div>
      )}
      <h4 className={`${titleColor} ${textSize} font-medium ${iconPosition === 'top-right' && icon ? 'pt-5' : ''}`}>{title}</h4>
      <p className={`${valueColor} ${valueSize} font-bold`}>{value}</p>
    </div>
  );
};

export default StatsCard;