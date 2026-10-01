import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  icon: Icon,
  className = ''
}) => {
  const variants = {
    default: 'bg-[#eef2f0] text-[var(--ink-muted)] border-[var(--border)]',
    primary: 'bg-[var(--ink)] text-white border-[var(--ink)]',
    success: 'bg-[var(--primary-muted)] text-[var(--primary)] border-[#b8dfd2]',
    emerald: 'bg-[var(--primary-muted)] text-[var(--primary)] border-[#b8dfd2]',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    orange: 'bg-orange-50 text-orange-800 border-orange-200',
    verified: 'bg-[var(--primary-muted)] text-[var(--primary-hover)] border-[#a8d5c6] font-semibold',
    driver: 'bg-[#e8f3f0] text-[var(--primary)] border-[#b8dfd2] font-semibold'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium border leading-none shrink-0 select-none ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.sm} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
