import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Car, Calendar, Star, DollarSign, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export const HowItWorksPage = () => {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="emerald" size="sm" className="mb-3">Simple & Reliable</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            How WedaMate Works
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Connecting you with vetted local professionals and verified drivers across Sri Lanka with transparent pricing and zero hassles.
          </p>
        </div>

        {/* Part 1: Standard Local Services */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-3 border-b border-slate-200">
            1. Booking Local Service Professionals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Discover & Compare</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter plumbers, electricians, cleaners, and technicians by Sri Lankan city, customer ratings, price range, and verification badges.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Book or Request Quote</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose fixed-price packages or describe your custom task to receive itemized quotation offers directly from nearby service providers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Complete & Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The provider executes the job at your home. Once marked complete, leave genuine feedback and star ratings to help the community.
              </p>
            </div>
          </div>
        </div>

        {/* Part 2: Drive My Vehicle Differentiator */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white border border-slate-800 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-4">
            <Car className="w-3.5 h-3.5" />
            <span>Specialty Service</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
            2. Drive My Vehicle — Your Car, Our Driver
          </h2>

          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed mb-8 font-normal">
            This is NOT ride-hailing. You provide your own vehicle (car, SUV, or passenger van). A licensed, background-checked professional arrives at your door to drive you wherever you need.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-200">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-white text-sm mb-1">Pick Your Vehicle Specs</h4>
              <p className="text-xs text-slate-400">Match manual or automatic transmission requirements with driver capabilities.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-white text-sm mb-1">Choose Rate Model</h4>
              <p className="text-xs text-slate-400">Hourly chauffeur, half-day (5h), or full-day outstation (10h) with transparent fees.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-white text-sm mb-1">Meet at Your Address</h4>
              <p className="text-xs text-slate-400">Driver arrives at your home, office, or airport terminal on schedule.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-white text-sm mb-1">Ride in Familiar Comfort</h4>
              <p className="text-xs text-slate-400">Safe, careful driving in your own vehicle with complete peace of mind.</p>
            </div>
          </div>

          <div className="pt-8">
            <Link to="/drivers">
              <Button variant="secondary" size="md" className="font-bold">
                Find a Driver for Your Vehicle
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
