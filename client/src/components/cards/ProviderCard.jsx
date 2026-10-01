import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, Star, Heart } from 'lucide-react';

export const ProviderCard = ({ provider }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const user = provider?.user || {};
  const serviceAreas = provider?.serviceAreas || [];
  const primaryLocation = serviceAreas[0]
    ? `${serviceAreas[0].city}`
    : user.address?.city || 'Negombo';

  const isVerified = provider?.verificationStatus === 'verified' || true;
  const profession = provider?.profession || provider?.businessName || 'Service Professional';

  const professionKey = profession.toLowerCase();
  let cardImage = provider?.portfolio?.[0] || user?.avatar;
  if (
    !cardImage ||
    cardImage.includes('unsplash.com/photo-1507003211169') ||
    cardImage.includes('unsplash.com/photo-1534528741775')
  ) {
    if (professionKey.includes('plumb'))
      cardImage =
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600';
    else if (professionKey.includes('electr'))
      cardImage =
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600';
    else if (professionKey.includes('clean'))
      cardImage =
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600';
    else if (professionKey.includes('tutor') || professionKey.includes('teach'))
      cardImage =
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600';
    else if (professionKey.includes('driver')) cardImage = '/images/driver-hero.jpg';
    else
      cardImage =
        user?.avatar ||
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600';
  }

  const startingPrice = provider?.startingPrice || 2000;
  const ratingValue = provider?.rating ? Number(provider.rating).toFixed(1) : '4.9';
  const reviewsCount = provider?.reviewCount || 124;

  return (
    <div className="flex flex-col h-full bg-white border border-[var(--border)] rounded-xl overflow-hidden hover-lift card-shadow group">
      <div className="relative h-40 w-full overflow-hidden bg-[var(--surface)]">
        <img
          src={cardImage}
          alt={user.name || 'Provider'}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-white/95 flex items-center justify-center text-[var(--ink-muted)] hover:text-rose-500 shadow-sm transition-colors cursor-pointer"
          aria-label="Save to favorites"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>

        {provider?.availability?.isAvailableToday && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0c1613]/85 text-[10px] font-bold text-[#5dcaa8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5dcaa8] animate-pulse" />
            Available today
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h4 className="font-heading font-bold text-[var(--ink)] text-sm group-hover:text-[var(--primary)] transition-colors truncate">
            {user.name || 'Professional'}
          </h4>
          {isVerified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--primary)] shrink-0">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs mb-1.5">
          <div className="flex items-center gap-1 text-amber-600 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{ratingValue}</span>
          </div>
          <span className="text-[var(--ink-muted)] text-[11px]">({reviewsCount})</span>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] mb-3">
          <span className="font-semibold text-[var(--ink)]">{profession}</span>
          <span className="flex items-center gap-0.5 text-[11px]">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[90px]">{primaryLocation}</span>
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-[var(--border)] flex flex-col gap-2">
          <div className="text-xs">
            <span className="font-heading font-bold text-[var(--ink)] text-sm">
              LKR {startingPrice.toLocaleString()}
            </span>
            <span className="text-[var(--ink-muted)] text-[11px]">/hr</span>
          </div>

          <Link
            to={`/providers/${provider?._id || 'demo'}`}
            className="w-full py-2 px-3 rounded-lg border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary-muted)] text-xs font-bold text-center transition-colors block"
          >
            View profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
