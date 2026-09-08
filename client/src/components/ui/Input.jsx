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
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5'
          } ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-rose-500 mt-0.5">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>}
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
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-white text-slate-900 text-sm rounded-xl border px-3.5 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
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
