import React from 'react';
import { AlertCircle, RefreshCw, FolderSearch, Loader2 } from 'lucide-react';
import Button from './Button.jsx';

export const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${rounded} ${className}`}
    />
  );
};

export const Loader = ({ message = 'Loading...', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} text-emerald-600 animate-spin`} />
      {message && <p className="text-xs font-semibold text-slate-500 tracking-wide">{message}</p>}
    </div>
  );
};

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No results found',
  description = 'Try adjusting your filters or search keywords.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white border border-slate-200/70 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const ErrorState = ({
  message = 'An unexpected error occurred while loading data.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-rose-50/50 border border-rose-100 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900 mb-1">Failed to load</h3>
      <p className="text-xs sm:text-sm text-rose-700 max-w-sm mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="primary" size="sm" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
