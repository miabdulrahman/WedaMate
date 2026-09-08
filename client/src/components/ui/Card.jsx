import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'default',
  onClick,
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/80 transition-all duration-200 ${
        glass ? 'glass-card' : 'bg-white'
      } ${
        hover
          ? 'hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
          : 'shadow-xs'
      } ${paddings[padding] || paddings.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
