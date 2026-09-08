import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow active:bg-slate-950 border border-slate-900',
    secondary:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:bg-emerald-800 border border-emerald-600',
    accent:
      'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow active:bg-orange-700 border border-orange-500',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 active:bg-slate-100',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 active:bg-slate-200',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow active:bg-rose-800 border border-rose-600',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow border border-emerald-600'
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs gap-1.5',
    sm: 'px-3.5 py-2 text-sm gap-2',
    md: 'px-5 py-2.5 text-sm gap-2.5',
    lg: 'px-6 py-3.5 text-base gap-3'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
