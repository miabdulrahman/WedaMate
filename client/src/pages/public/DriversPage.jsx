import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Car,
  ShieldCheck,
  Search,
  MapPin,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Calendar,
  Key,
  Shield,
  HeartHandshake,
  DollarSign
} from 'lucide-react';
import driverService from '../../services/driverService.js';
import DriverCard from '../../components/cards/DriverCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Skeleton, EmptyState, ErrorState } from '../../components/ui/FeedbackStates.jsx';

export const DriversPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [drivers, setDrivers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick trip booking bar states (from reference Image 2)
  const [pickupCity, setPickupCity] = useState(searchParams.get('pickup') || 'Negombo');
  const [destCity, setDestCity] = useState(searchParams.get('destination') || 'Gampaha');
  const [tripDateTime, setTripDateTime] = useState('2026-09-10T10:00');

  const city = searchParams.get('city') || '';
  const transmission = searchParams.get('transmission') || '';
  const vehicleType = searchParams.get('vehicleType') || '';
  const minExperience = searchParams.get('minExperience') || '';
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
  const sort = searchParams.get('sort') || 'recommended';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await driverService.getDrivers({
          city: city || pickupCity,
          transmission,
          vehicleType,
          minExperience,
          verifiedOnly,
          sort,
          page,
          limit: 12
        });
        setDrivers(res.drivers || []);
        setPagination(res.pagination || { total: 0, page: 1, pages: 1 });
      } catch (err) {
        setError(err.message || 'Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [city, pickupCity, transmission, vehicleType, minExperience, verifiedOnly, sort, page]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleTripSearch = (e) => {
    e.preventDefault();
    updateParam('city', pickupCity);
  };

  const cities = [
    'All Regions',
    'Negombo',
    'Colombo',
    'Gampaha',
    'Katunayake',
    'Ja-Ela',
    'Wattala',
    'Kelaniya',
    'Panadura',
    'Kalutara'
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/40">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER (Matching Image 2: Driver Service - Own Vehicle)           */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white py-12 sm:py-16 border-b border-emerald-800/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-emerald-300 text-xs font-bold border border-white/15">
                <Car className="w-3.5 h-3.5" />
                <span>Drive My Vehicle Service</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Hire Drivers <br />
                for Your Own Vehicle
              </h1>

              <p className="text-emerald-100/90 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
                Safe, reliable and affordable drivers for your own vehicle. Travel with confidence across Sri Lanka.
              </p>
            </div>

            {/* Right Driver Photo */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-16/10 sm:aspect-16/9 bg-slate-800">
                <img
                  src="/images/driver-hero.jpg"
                  alt="Verified personal driver in Sri Lanka"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Quick Search Form Box (Matching Image 2) */}
          <form
            onSubmit={handleTripSearch}
            className="mt-8 bg-white p-3 rounded-2xl shadow-xl text-slate-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center border border-slate-200"
          >
            {/* Pickup Location */}
            <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Pickup Location
              </span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <select
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {cities.filter((c) => c !== 'All Regions').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Destination */}
            <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Destination
              </span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <select
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {cities.filter((c) => c !== 'All Regions').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Date & Time
              </span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="datetime-local"
                  value={tripDateTime}
                  onChange={(e) => setTripDateTime(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Find Driver Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              Find Driver
            </button>
          </form>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. WHY CHOOSE OUR DRIVERS? (Matching Image 2: 4 cards)                    */}
      {/* ========================================================================= */}
      <section className="py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Why Choose Our Drivers?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Verified Drivers</h3>
              <p className="text-[11px] text-slate-500 mt-1">Background checked with verified Sri Lankan driving licenses</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Safe & Reliable</h3>
              <p className="text-[11px] text-slate-500 mt-1">Experienced handling sedans, SUVs, and passenger vans</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Flexible Booking</h3>
              <p className="text-[11px] text-slate-500 mt-1">Hourly, half-day, or full-day outstation packages</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center text-center hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Affordable Rates</h3>
              <p className="text-[11px] text-slate-500 mt-1">Transparent pricing in LKR with zero hidden surcharges</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DRIVERS DIRECTORY                                                      */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Transmission Skill Filter */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200/60">
              <Key className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-1">
                  Transmission
                </span>
                <select
                  value={transmission}
                  onChange={(e) => updateParam('transmission', e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="">Any Transmission</option>
                  <option value="automatic">Automatic Only</option>
                  <option value="manual">Manual Only</option>
                </select>
              </div>
            </div>

            {/* Vehicle Type Filter */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200/60">
              <Car className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-1">
                  Vehicle Category
                </span>
                <select
                  value={vehicleType}
                  onChange={(e) => updateParam('vehicleType', e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="">All Vehicle Types</option>
                  <option value="Car">Sedan / Hatchback (Car)</option>
                  <option value="SUV">SUV / Crossover</option>
                  <option value="Van">Passenger Van (KDH, etc.)</option>
                  <option value="Pickup">Double-Cab / Pickup</option>
                </select>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200/60">
              <Award className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-1">
                  Sort By
                </span>
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="price_low">Hourly Rate: Low to High</option>
                  <option value="price_high">Hourly Rate: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Available Drivers ({pagination.total || drivers.length})
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-72 rounded-3xl" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          ) : drivers.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No drivers match your current filter"
              description="Try changing transmission type or selecting Negombo or Colombo region."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver) => (
                <DriverCard key={driver._id} driver={driver} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DriversPage;
