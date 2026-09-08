import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Tag, ArrowRight, Star, Users, CheckCircle } from 'lucide-react';

const serviceImages = {
  plumbing: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600',
  electrical: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
  ac: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
  computer: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&q=80&w=600',
  tutoring: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600',
  photography: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
  painting: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600',
  gardening: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600',
  driver: '/images/driver-hero.jpg'
};

export const ServiceCard = ({ service }) => {
  const slug = (service.category?.slug || service.category?.name || service.title || '').toLowerCase();
  
  let image = service.imageUrl;
  if (!image) {
    if (slug.includes('plumb')) image = serviceImages.plumbing;
    else if (slug.includes('elect')) image = serviceImages.electrical;
    else if (slug.includes('clean')) image = serviceImages.cleaning;
    else if (slug.includes('ac') || slug.includes('air')) image = serviceImages.ac;
    else if (slug.includes('comp') || slug.includes('laptop')) image = serviceImages.computer;
    else if (slug.includes('tutor')) image = serviceImages.tutoring;
    else if (slug.includes('photo')) image = serviceImages.photography;
    else if (slug.includes('paint')) image = serviceImages.painting;
    else if (slug.includes('garden')) image = serviceImages.gardening;
    else if (slug.includes('driv') || slug.includes('car')) image = serviceImages.driver;
    else image = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600';
  }

  const basePrice = service.basePrice || 2000;
  const rating = 4.8;
  const providerCount = service.providerCount || 8;

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover-lift card-shadow group">
      {/* Service Image */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={service.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {service.popular && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
            Popular
          </span>
        )}
      </div>

      {/* Service Details */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
          {service.category?.name || service.subcategory || 'Local Service'}
        </span>

        <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1.5">
          {service.title}
        </h4>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-slate-500">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{providerCount}+ providers</span>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Starting from</span>
            <span className="text-sm font-extrabold text-slate-900">
              LKR {basePrice.toLocaleString()}
            </span>
          </div>

          <Link
            to={`/services?search=${encodeURIComponent(service.title)}`}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 text-xs font-bold transition-colors inline-flex items-center gap-1"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
