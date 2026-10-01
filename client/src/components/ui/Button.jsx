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
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-sm border border-transparent',
    secondary:
      'bg-[var(--ink)] hover:bg-[#0c1613] text-white shadow-sm border border-transparent',
    accent:
      'bg-[var(--accent)] hover:bg-[var(--primary)] text-white shadow-sm border border-transparent',
    outline:
      'bg-white hover:bg-[var(--primary-soft)] text-[var(--ink)] border border-[var(--border-strong)] hover:border-[var(--primary)]',
    ghost:
      'bg-transparent hover:bg-[var(--primary-muted)] text-[var(--ink-muted)] hover:text-[var(--ink)]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-transparent',
    success:
      'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-sm border border-transparent'
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
