import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Car,
  ShieldCheck,
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
  Users
} from 'lucide-react';
import providerService from '../../services/providerService.js';
import ProviderCard from '../../components/cards/ProviderCard.jsx';

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

const categories = [
  { name: 'Plumbing', icon: Wrench, query: 'Plumbing' },
  { name: 'Electrical', icon: Zap, query: 'Electrician' },
  { name: 'Cleaning', icon: Sparkles, query: 'Cleaning' },
  { name: 'AC Repair', icon: Wind, query: 'AC Repair' },
  { name: 'Computer Repair', icon: Laptop, query: 'Computer Repair' },
  { name: 'Tutoring', icon: GraduationCap, query: 'Tutoring' },
  { name: 'Photography', icon: Camera, query: 'Photography' },
  { name: 'Painting', icon: Paintbrush, query: 'Painting' },
  { name: 'Gardening', icon: Sprout, query: 'Gardening' },
  { name: 'Moving', icon: Truck, query: 'Moving' },
  { name: 'Vehicle Services', icon: Car, query: 'Vehicle' },
  { name: 'More', icon: Grid, query: '' }
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Negombo');
  const [featuredProviders, setFeaturedProviders] = useState(mockFeaturedProviders);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const provRes = await providerService.getProviders({ limit: 5, sort: 'recommended' });
        if (provRes.providers && provRes.providers.length > 0) {
          setFeaturedProviders(provRes.providers);
        }
      } catch {
        // Keep mock fallback
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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Full-bleed hero — brand first, one composition */}
      <section className="relative min-h-[min(92vh,820px)] flex items-end sm:items-center overflow-hidden">
        <img
          src="/images/hero-technician.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 animate-fade-in"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=1600';
          }}
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1613]/80 via-transparent to-[#0c1613]/30" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-28 sm:py-24">
          <div className="max-w-2xl">
            <p className="animate-fade-up font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-none mb-5">
              Weda<span className="text-[#5dcaa8]">Mate</span>
            </p>

            <h1 className="animate-fade-up-delay font-heading text-2xl sm:text-3xl lg:text-[2.15rem] font-semibold text-white/95 tracking-tight leading-snug mb-3">
              Trusted local help, when you need it
            </h1>

            <p className="animate-fade-up-delay text-sm sm:text-base text-white/70 max-w-md leading-relaxed mb-8">
              Book verified professionals across Sri Lanka — or hire a driver for your own vehicle.
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="animate-fade-up-delay-2 bg-white/95 backdrop-blur-sm p-1.5 sm:p-2 rounded-xl hero-search-shadow flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 max-w-xl mb-6"
            >
              <div className="flex items-center gap-2 px-3 py-2.5 flex-1 min-w-0">
                <Search className="w-4 h-4 text-[var(--ink-muted)] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What service do you need?"
                  className="w-full bg-transparent text-sm text-[var(--ink)] placeholder:text-[#8a9a93] font-medium focus:outline-none"
                />
              </div>

              <div className="hidden sm:block h-8 w-px bg-[var(--border)]" />

              <div className="flex items-center gap-1.5 px-3 py-2 sm:py-0 text-[var(--ink)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent text-[var(--ink)] text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-bold transition-colors shrink-0 cursor-pointer"
              >
                Search
              </button>
            </form>

            <div className="animate-fade-up-delay-2 flex flex-wrap items-center gap-3">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-bold transition-colors"
              >
                Find a service
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/drivers"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/18 text-white text-sm font-bold border border-white/25 backdrop-blur-sm transition-colors"
              >
                <Car className="w-4 h-4" />
                Drive my vehicle
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20 surface-mesh border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                Popular categories
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mt-1">
                Skilled help near you, ready to book.
              </p>
            </div>
            <Link
              to="/services"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    if (cat.query) {
                      navigate(
                        `/services?search=${encodeURIComponent(cat.query)}&city=${selectedLocation}`
                      );
                    } else {
                      navigate('/services');
                    }
                  }}
                  className="category-tile bg-white border border-[var(--border)] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-lg bg-[var(--primary-muted)] text-[var(--primary)] flex items-center justify-center mb-2.5 transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--ink)] line-clamp-1">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-white border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
              How WedaMate works
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mt-2">
              Four simple steps from search to done.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Find a service',
                desc: 'Search by need and city.'
              },
              {
                step: '02',
                icon: Users,
                title: 'Choose a provider',
                desc: 'Compare ratings and rates.'
              },
              {
                step: '03',
                icon: Clock,
                title: 'Book a time',
                desc: 'Pick a slot that works.'
              },
              {
                step: '04',
                icon: CheckCircle2,
                title: 'Get it done',
                desc: 'Relax — we handle the rest.'
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative pt-1">
                  <span className="font-heading text-4xl font-bold text-[var(--primary-muted)] absolute -top-1 right-0 tabular-nums">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-[var(--ink)] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Drive My Vehicle promo — full-bleed visual */}
      <section className="relative overflow-hidden min-h-[380px] sm:min-h-[420px] flex items-center">
        <img
          src="/images/driver-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1600';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1613]/92 via-[#0c1613]/75 to-[#0c1613]/35" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-[#5dcaa8] mb-3">
              Drive My Vehicle
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
              Hire a driver for your own car
            </h2>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-6">
              Verified chauffeurs for errands, airport runs, and daily drives — you keep your vehicle, they take the wheel.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-white/85 mb-8">
              {['Verified drivers', 'Flexible booking', 'Safe & reliable'].map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5dcaa8] shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
            <Link
              to="/drivers"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-bold transition-colors"
            >
              Find a driver
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="py-16 sm:py-20 bg-white border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
              Why choose WedaMate
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mt-2">
              Built for trust, clarity, and local convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: 'Trusted providers',
                desc: 'Verified and reviewed professionals.'
              },
              {
                icon: CreditCard,
                title: 'Secure payments',
                desc: 'Clear pricing and safe checkout.'
              },
              {
                icon: MapPin,
                title: 'Local focus',
                desc: 'Supporting workers near you.'
              },
              {
                icon: Headphones,
                title: 'Real support',
                desc: 'Help when something goes wrong.'
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[var(--primary-muted)] text-[var(--primary)] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-[var(--ink)] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured providers */}
      <section className="py-16 sm:py-20 surface-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                Featured providers
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mt-1">
                Top-rated professionals in your area.
              </p>
            </div>
            <Link
              to="/services?tab=providers"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
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
