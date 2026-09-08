import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  icon: Icon,
  className = ''
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-slate-900 text-white border-slate-900',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    verified: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    driver: 'bg-sky-50 text-sky-800 border-sky-300 font-semibold'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border leading-none shrink-0 select-none ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.sm} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
