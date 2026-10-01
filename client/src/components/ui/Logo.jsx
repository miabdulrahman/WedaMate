import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Temporary logo — replace /logo.png in client/public with your final brand mark.
 */
export const Logo = ({
  size = 'md',
  showTagline = false,
  to = '/',
  className = '',
  wordmark = true,
  theme = 'light'
}) => {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]', gap: 'gap-2' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]', gap: 'gap-2.5' },
    lg: { icon: 'w-11 h-11', text: 'text-2xl', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 'w-14 h-14', text: 'text-3xl', sub: 'text-sm', gap: 'gap-3.5' }
  };

  const selected = sizeClasses[size] || sizeClasses.md;
  const isDark = theme === 'dark';

  const content = (
    <div className={`flex items-center ${selected.gap} select-none group ${className}`}>
      <div
        className={`${selected.icon} shrink-0 overflow-hidden rounded-xl ring-1 ${
          isDark ? 'ring-white/15 bg-white' : 'ring-[var(--border)] bg-white shadow-sm'
        } transition-transform duration-300 group-hover:scale-[1.03]`}
      >
        <img
          src="/logo.png"
          alt="WedaMate"
          className="w-full h-full object-cover"
        />
      </div>

      {wordmark && (
        <div className="flex flex-col leading-none min-w-0">
          <span className={`font-heading font-bold tracking-tight ${selected.text}`}>
            <span className={isDark ? 'text-white' : 'text-[var(--ink)]'}>Weda</span>
            <span className={isDark ? 'text-[#5dcaa8]' : 'text-[var(--primary)]'}>Mate</span>
          </span>
          {showTagline && (
            <span
              className={`font-medium tracking-wide mt-1 ${selected.sub} ${
                isDark ? 'text-[#8a9e96]' : 'text-[var(--ink-muted)]'
              }`}
            >
              Local Services, Made Easy.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center hover:opacity-95 transition-opacity" aria-label="WedaMate home">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
