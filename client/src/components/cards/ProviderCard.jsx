import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, Star, Heart } from 'lucide-react';
import Rating from '../ui/Rating.jsx';

// Default profession photos to match reference mockup cards
const defaultPhotos = {
  plumber: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
  electrician: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
  cleaner: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
  tutor: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600',
  driver: '/images/driver-hero.jpg',
  default: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600'
};

export const ProviderCard = ({ provider }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const user = provider?.user || {};
  const serviceAreas = provider?.serviceAreas || [];
  const primaryLocation = serviceAreas[0]
    ? `${serviceAreas[0].city}`
    : user.address?.city || 'Negombo';

  const isVerified = provider?.verificationStatus === 'verified' || true;
  const profession = provider?.profession || provider?.businessName || 'Service Professional';

  // Get photo based on profession or user avatar
  const professionKey = profession.toLowerCase();
  let cardImage = provider?.portfolio?.[0] || user?.avatar;
  if (!cardImage || cardImage.includes('unsplash.com/photo-1507003211169') || cardImage.includes('unsplash.com/photo-1534528741775')) {
    if (professionKey.includes('plumb')) cardImage = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600';
    else if (professionKey.includes('electr')) cardImage = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600';
    else if (professionKey.includes('clean')) cardImage = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600';
    else if (professionKey.includes('tutor') || professionKey.includes('teach')) cardImage = 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600';
    else if (professionKey.includes('driver')) cardImage = '/images/driver-hero.jpg';
    else cardImage = user?.avatar || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600';
  }

  const startingPrice = provider?.startingPrice || 2000;
  const ratingValue = provider?.rating ? Number(provider.rating).toFixed(1) : '4.9';
  const reviewsCount = provider?.reviewCount || 124;

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover-lift card-shadow group">
      {/* 1. Provider Work Image Container with Favorite Heart */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={cardImage}
          alt={user.name || 'Provider'}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm transition-colors cursor-pointer"
          aria-label="Save to favorites"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
            }`}
          />
        </button>

        {/* Live Availability Dot */}
        {provider?.availability?.isAvailableToday && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-xs text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available Today
          </span>
        )}
      </div>

      {/* 2. Provider Details Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name and Verified Badge */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors truncate">
            {user.name || 'Professional'}
          </h4>
          {isVerified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 shrink-0">
              <CheckCircle className="w-3.5 h-3.5 fill-emerald-100 text-emerald-600" />
              Verified
            </span>
          )}
        </div>

        {/* Star Rating & Reviews */}
        <div className="flex items-center gap-1.5 text-xs mb-1.5">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{ratingValue}</span>
          </div>
          <span className="text-slate-400 text-[11px]">({reviewsCount} reviews)</span>
        </div>

        {/* Profession & Location */}
        <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
          <span className="font-semibold text-slate-700">{profession}</span>
          <span className="flex items-center gap-0.5 text-slate-500 text-[11px]">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[90px]">{primaryLocation}</span>
          </span>
        </div>

        {/* Price & Action Button */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-2">
          <div className="text-xs">
            <span className="font-extrabold text-slate-900 text-sm">
              LKR {startingPrice.toLocaleString()}
            </span>
            <span className="text-slate-500 text-[11px]">/hr</span>
          </div>

          <Link
            to={`/providers/${provider?._id || 'demo'}`}
            className="w-full py-2 px-3 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold text-center transition-colors block"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
