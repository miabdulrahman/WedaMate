import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ size = 'md', showTagline = false, to = '/', className = '' }) => {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-8 h-8', text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-12 h-12', text: 'text-3xl', sub: 'text-sm' }
  };

  const selected = sizeClasses[size] || sizeClasses.md;

  const content = (
    <div className={`flex items-center gap-2 select-none group ${className}`}>
      {/* WedaMate Stylized 4-Leaf/Flower Emblem */}
      <div className={`${selected.icon} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* 4 organic petals in emerald green matching reference mark */}
          <circle cx="20" cy="11" r="7" fill="#059669" />
          <circle cx="29" cy="20" r="7" fill="#10B981" />
          <circle cx="20" cy="29" r="7" fill="#047857" />
          <circle cx="11" cy="20" r="7" fill="#34D399" />
          <circle cx="20" cy="20" r="4.5" fill="#FFFFFF" />
          <circle cx="20" cy="20" r="2.5" fill="#065F46" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight ${selected.text} flex items-center`}>
          <span className="text-slate-900">Weda</span>
          <span className="text-emerald-600">Mate</span>
        </span>
        {showTagline && (
          <span className={`font-semibold text-slate-400 tracking-wide uppercase mt-0.5 ${selected.sub}`}>
            Local Services, Made Easy.
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
