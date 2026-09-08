import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Car,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  Wrench,
  Zap,
  Sparkles,
  Wind,
  Laptop,
  GraduationCap,
  Camera,
  Paintbrush,
  Sprout,
  Truck,
  Grid,
  CreditCard,
  Headphones,
  Users,
  Award,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import providerService from '../../services/providerService.js';
import serviceService from '../../services/serviceService.js';
import ProviderCard from '../../components/cards/ProviderCard.jsx';
import Button from '../../components/ui/Button.jsx';

// Fallback featured providers matching the exact mockups in Image 1
const mockFeaturedProviders = [
  {
    _id: 'prov-1',
    user: {
      name: 'Nimal Perera',
      avatar: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600',
      address: { city: 'Negombo' }
    },
    profession: 'Plumber',
    rating: 4.9,
    reviewCount: 124,
    startingPrice: 2000,
    verificationStatus: 'verified',
    serviceAreas: [{ city: 'Negombo' }]
  },
  {
    _id: 'prov-2',
    user: {
      name: 'Saman Kumara',
      avatar: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
      address: { city: 'Negombo' }
    },
    profession: 'Electrician',
    rating: 4.8,
    reviewCount: 98,
    startingPrice: 2000,
    verificationStatus: 'verified',
    serviceAreas: [{ city: 'Negombo' }]
  },
  {
    _id: 'prov-3',
    user: {
      name: 'Kasun Silva',
      avatar: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
      address: { city: 'Gampaha' }
    },
    profession: 'Cleaner',
    rating: 4.7,
    reviewCount: 76,
    startingPrice: 1500,
    verificationStatus: 'verified',
    serviceAreas: [{ city: 'Gampaha' }]
  },
  {
    _id: 'prov-4',
    user: {
      name: 'Priyanka Fernando',
      avatar: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600',
      address: { city: 'Negombo' }
    },
    profession: 'Tutor',
    rating: 4.9,
    reviewCount: 110,
    startingPrice: 1000,
    verificationStatus: 'verified',
    serviceAreas: [{ city: 'Negombo' }]
  },
  {
    _id: 'prov-5',
    user: {
      name: 'Tharindu Jayasinghe',
      avatar: '/images/driver-hero.jpg',
      address: { city: 'Negombo' }
    },
    profession: 'Driver',
    rating: 4.8,
    reviewCount: 62,
    startingPrice: 1800,
    verificationStatus: 'verified',
    serviceAreas: [{ city: 'Negombo' }]
  }
];

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Negombo');
  const [featuredProviders, setFeaturedProviders] = useState(mockFeaturedProviders);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const provRes = await providerService.getProviders({ limit: 5, sort: 'recommended' });
        if (provRes.providers && provRes.providers.length > 0) {
          setFeaturedProviders(provRes.providers);
        }
      } catch (err) {
        // Fallback already pre-seeded
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedLocation) params.append('city', selectedLocation);
    navigate(`/services?${params.toString()}`);
  };

  const locations = [
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

  // 12 Service Categories directly from the reference mockup
  const categories = [
    { name: 'Plumbing', icon: Wrench, bg: 'bg-blue-50 text-blue-600', query: 'Plumbing' },
    { name: 'Electrical', icon: Zap, bg: 'bg-amber-50 text-amber-500', query: 'Electrician' },
    { name: 'Cleaning', icon: Sparkles, bg: 'bg-emerald-50 text-emerald-600', query: 'Cleaning' },
    { name: 'AC Repair', icon: Wind, bg: 'bg-cyan-50 text-cyan-600', query: 'AC Repair' },
    { name: 'Computer Repair', icon: Laptop, bg: 'bg-purple-50 text-purple-600', query: 'Computer Repair' },
    { name: 'Tutoring', icon: GraduationCap, bg: 'bg-rose-50 text-rose-500', query: 'Tutoring' },
    { name: 'Photography', icon: Camera, bg: 'bg-sky-50 text-sky-600', query: 'Photography' },
    { name: 'Painting', icon: Paintbrush, bg: 'bg-orange-50 text-orange-500', query: 'Painting' },
    { name: 'Gardening', icon: Sprout, bg: 'bg-green-50 text-green-600', query: 'Gardening' },
    { name: 'Moving', icon: Truck, bg: 'bg-blue-50 text-blue-500', query: 'Moving' },
    { name: 'Vehicle Services', icon: Car, bg: 'bg-violet-50 text-violet-600', query: 'Vehicle' },
    { name: 'More', icon: Grid, bg: 'bg-slate-100 text-slate-600', query: '' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Directly matching Image 1)                               */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f9f6] via-[#f7fcfb] to-white pt-10 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headings, Search Pill, Action Buttons */}
            <div className="lg:col-span-6 xl:col-span-7 text-left space-y-6">
              {/* Badge: Local Services Marketplace */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold tracking-wide">
                <span>Local Services Marketplace</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Find Trusted Local <br />
                Services <span className="text-emerald-500 font-black">Near You</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed font-normal">
                Connect with skilled service providers in your area and get the help you need, when you need it.
              </p>

              {/* Floating Pill Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 rounded-full border border-slate-200 hero-search-shadow flex flex-col sm:flex-row items-center gap-1 max-w-xl"
              >
                {/* Search Input */}
                <div className="flex items-center gap-2 px-3.5 py-2 flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What service do you need?"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none"
                  />
                </div>

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                {/* Location Select */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 w-full sm:w-auto text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer pr-2"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc} className="text-slate-900">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
                >
                  <span>Find a Service</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/become-provider"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
                >
                  <span>Become a Service Provider</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Visual, Handwritten Script Overlay, Floating Driver Card */}
            <div className="lg:col-span-6 xl:col-span-5 relative mt-6 lg:mt-0">
              {/* Photo Frame Container */}
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Photo: Sri Lankan serviceman beside car */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-4/3 sm:aspect-square">
                  <img
                    src="/images/hero-technician.jpg"
                    alt="Trusted WedaMate Local Service Technician in Sri Lanka"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Subtle bottom gradient to highlight overlay badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Hand-drawn Script Overlay: "Trusted Local People Real Help" */}
                <div className="absolute -top-3 sm:-top-5 right-2 sm:-right-4 select-none pointer-events-none z-20">
                  <div className="bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl shadow-lg border border-slate-100 rotate-3 text-center">
                    <p className="font-handwriting text-slate-800 text-base sm:text-lg font-bold leading-tight">
                      Trusted <br />
                      <span className="text-emerald-700 font-extrabold">Local People</span> <br />
                      Real Help
                    </p>
                    {/* Hand-drawn arrow svg */}
                    <svg className="w-5 h-5 text-emerald-600 mx-auto mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Floating Promo Pill Card: "Need a Driver? Hire a professional driver for your own vehicle." */}
                <Link
                  to="/drivers"
                  className="absolute -bottom-5 sm:-bottom-6 left-2 sm:-left-6 right-2 sm:right-auto bg-white rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-200/80 flex items-center gap-3 hover-lift z-20 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Car className="w-5 h-5" />
                  </div>
                  <div className="pr-3 text-left">
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Need a Driver?
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      Hire a professional driver for your own vehicle.
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 ml-auto group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. POPULAR SERVICE CATEGORIES (Matching Image 1 Grid of 12 pills)         */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Popular Service Categories
            </h2>
            <Link
              to="/services"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span>View All Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 12 Category Pill Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (cat.query) {
                      navigate(`/services?search=${encodeURIComponent(cat.query)}&city=${selectedLocation}`);
                    } else {
                      navigate('/services');
                    }
                  }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center justify-center text-center category-pill cursor-pointer group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${cat.bg} flex items-center justify-center mb-2.5 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW WEDAMATE WORKS + HIRE DRIVERS FEATURE CARD                         */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: 4 Step Process */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  How WedaMate Works
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Getting your service is simple and stress-free.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Step 1 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">1. Find a Service</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Search for the service you need in your area.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">2. Choose a Provider</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Compare profiles, ratings and prices.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">3. Request the Service</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Select date, time and add details.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">4. Get the Job Done</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Relax while the professional takes care of it.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Featured Promo Card (Hire Drivers for Your Own Vehicle) */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#e6f7f0] via-[#edf9f4] to-[#d8f3e5] border border-emerald-200/80 shadow-lg relative overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-7 space-y-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-white text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                      New Feature
                    </span>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      Hire Drivers <br />
                      for Your Own Vehicle
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Travel, run errands, or get to work — hire a professional driver and enjoy a safe and convenient ride.
                    </p>

                    <Link
                      to="/drivers"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Find a Driver</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* Checkmark Perks */}
                    <div className="pt-2 space-y-1.5 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Verified Drivers</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Safe & Reliable</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Flexible Booking</span>
                      </div>
                    </div>
                  </div>

                  {/* Driver Visual inside car */}
                  <div className="sm:col-span-5">
                    <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white aspect-4/3 sm:aspect-square">
                      <img
                        src="/images/driver-hero.jpg"
                        alt="Smiling professional Sri Lankan chauffeur driver in car"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHY CHOOSE WEDAMATE? (Matching Image 1: 4 value props)                 */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-left">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Why Choose WedaMate?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              We make local services easier, safer and more reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Trusted Providers */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Trusted Providers</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                  Verified and reviewed service providers.
                </p>
              </div>
            </div>

            {/* 2. Secure Payments */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Secure Payments</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                  Multiple secure payment options.
                </p>
              </div>
            </div>

            {/* 3. Local Focus */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Local Focus</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                  Supporting local businesses & workers.
                </p>
              </div>
            </div>

            {/* 4. 24/7 Support */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">24/7 Support</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                  We're here to help, anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FEATURED SERVICE PROVIDERS (Matching Image 1: Top Rated Professionals) */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-16 bg-slate-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Featured Service Providers
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Top rated and trusted professionals in your area.
              </p>
            </div>
            <Link
              to="/services?tab=providers"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span>View All Providers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider._id} provider={provider} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
