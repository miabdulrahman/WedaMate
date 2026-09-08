import React from 'react';
import { Star } from 'lucide-react';

export const Rating = ({
  value = 5,
  count,
  size = 'sm',
  interactive = false,
  onChange,
  className = ''
}) => {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const starSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <div className="flex items-center gap-0.5">
        {stars.map((s) => {
          const filled = s <= Math.round(value);
          return (
            <button
              key={s}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(s)}
              className={`${
                interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
              } p-0.5 focus:outline-none`}
            >
              <Star
                className={`${starSize} ${
                  filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {value !== undefined && (
        <span className="text-xs font-bold text-slate-900 ml-0.5">
          {Number(value).toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className="text-xs text-slate-500 font-normal">
          ({count})
        </span>
      )}
    </div>
  );
};

export default Rating;
