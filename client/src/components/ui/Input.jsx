import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[var(--ink)] tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-[var(--ink-muted)]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full bg-white text-[var(--ink)] placeholder:text-[#8a9a93] text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5'
          } ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
              : 'border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-[var(--primary-muted)]'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-rose-500 mt-0.5">{error}</p>}
      {!error && helperText && <p className="text-xs text-[var(--ink-muted)] mt-0.5">{helperText}</p>}
    </div>
  );
};

export const Select = ({
  label,
  error,
  options = [],
  className = '',
  id,
  children,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[var(--ink)] tracking-wide">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-white text-[var(--ink)] text-sm rounded-lg border px-3.5 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
            : 'border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-[var(--primary-muted)]'
        } ${className}`}
        {...props}
      >
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
      {error && <p className="text-xs font-medium text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
};

export default Input;
