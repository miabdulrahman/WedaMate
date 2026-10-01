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
      className={`rounded-2xl border border-[var(--border)] transition-all duration-200 ${
        glass ? 'glass-panel' : 'bg-white'
      } ${
        hover
          ? 'hover:border-[var(--border-strong)] hover:shadow-md hover:-translate-y-0.5 cursor-pointer card-shadow'
          : 'card-shadow'
      } ${paddings[padding] || paddings.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
