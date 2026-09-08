import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Filter, Star, CheckCircle, ArrowUpDown, X, Wrench, SlidersHorizontal } from 'lucide-react';
import providerService from '../../services/providerService.js';
import serviceService from '../../services/serviceService.js';
import ProviderCard from '../../components/cards/ProviderCard.jsx';
import ServiceCard from '../../components/cards/ServiceCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { Skeleton, EmptyState, ErrorState } from '../../components/ui/FeedbackStates.jsx';

export const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'catalog' ? 'catalog' : 'providers');

  useEffect(() => {
    if (tabParam === 'catalog' || tabParam === 'providers') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states from URL or defaults
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const rating = searchParams.get('rating') || '';
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
  const sort = searchParams.get('sort') || 'recommended';
  const page = parseInt(searchParams.get('page') || '1');

  // Load Categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await serviceService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Providers or Services whenever query params or active tab change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (activeTab === 'providers') {
          const res = await providerService.getProviders({
            search,
            category,
            city,
            rating,
            verifiedOnly,
            sort,
            page,
            limit: 12
          });
          setProviders(res.providers || []);
          setPagination(res.pagination || { total: 0, page: 1, pages: 1 });
        } else {
          const res = await serviceService.getServices({
            search,
            category,
            page,
            limit: 12
          });
          setServices(res.services || []);
          setPagination(res.pagination || { total: 0, page: 1, pages: 1 });
        }
      } catch (err) {
        setError(err.message || 'Failed to load local services');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, category, city, rating, verifiedOnly, sort, page, activeTab]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset page on filter change
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const sriLankanCities = [
    'All Sri Lanka',
    'Negombo',
    'Colombo',
    'Gampaha',
    'Katunayake',
    'Ja-Ela',
    'Wattala',
    'Kelaniya',
    'Minuwangoda',
    'Panadura',
    'Kalutara'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase block mb-1">
            Service Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Discover Verified Local Services
          </h1>
        </div>

        {/* View Toggle: Providers vs Services Catalog */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('providers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'providers'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified Providers ({activeTab === 'providers' ? pagination.total : '...'})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Services Catalog
          </button>
        </div>
      </div>

      {/* Main Search Bar & Quick Filters Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Keyword Search */}
          <div className="flex items-center gap-2.5 px-3 py-2 flex-1 w-full bg-slate-50 rounded-xl">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              defaultValue={search}
              onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
              onBlur={(e) => updateParam('search', e.target.value)}
              placeholder="Search by skill, profession, or task (e.g. Plumber, AC Repair, Painter)..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl w-full sm:w-56">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={city || 'All Sri Lanka'}
              onChange={(e) => updateParam('city', e.target.value === 'All Sri Lanka' ? '' : e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              {sriLankanCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl w-full sm:w-52">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="jobs">Most Jobs Completed</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          {/* Mobile Filter Toggle Button */}
          <Button
            variant="outline"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden w-full sm:w-auto"
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Main Content Layout (Sidebar Filters + Results Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-6 bg-white p-5 rounded-3xl border border-slate-200/80 h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Filter Results</h3>
            {(category || rating || verifiedOnly) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Service Category
            </label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => updateParam('category', '')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  !category ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                    category === cat.slug
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.subcategories?.length > 0 && (
                    <span className="text-[10px] opacity-60">({cat.subcategories.length})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Only Toggle */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Verified Only
              </span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => updateParam('verifiedOnly', e.target.checked ? 'true' : '')}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Minimum Rating Filter */}
          <div className="pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Customer Rating
            </label>
            <div className="space-y-1.5 text-xs">
              {[
                { val: '', label: 'Any Rating' },
                { val: '4.8', label: '4.8★ and above' },
                { val: '4.5', label: '4.5★ and above' },
                { val: '4.0', label: '4.0★ and above' }
              ].map((r) => (
                <label key={r.val} className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                  <input
                    type="radio"
                    name="ratingFilter"
                    checked={rating === r.val}
                    onChange={() => updateParam('rating', r.val)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {error && <ErrorState message={error} onRetry={() => updateParam('page', '1')} className="mb-8" />}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : activeTab === 'providers' ? (
            providers.length === 0 ? (
              <EmptyState
                title="No providers found"
                description="We couldn't find any professionals matching your search criteria in this region."
                actionLabel="Clear all filters"
                onAction={clearAllFilters}
              />
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {providers.map((p) => (
                    <ProviderCard key={p._id} provider={p} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => updateParam('page', pNum)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                          page === pNum
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : services.length === 0 ? (
            <EmptyState
              title="No services found"
              description="No services match your keywords or category."
              actionLabel="Clear filters"
              onAction={clearAllFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map((s) => (
                <ServiceCard key={s._id} service={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
