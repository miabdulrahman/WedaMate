import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  Search,
  MapPin,
  Menu,
  X,
  ChevronDown,
  Briefcase,
  Calendar,
  Settings,
  LogOut,
  Car,
  Shield,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import Logo from '../ui/Logo.jsx';
import Button from '../ui/Button.jsx';

export const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isProvider, isDriver, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const [currentCity, setCurrentCity] = useState('Negombo');

  const userRef = useRef(null);
  const notifRef = useRef(null);
  const locationRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const locations = [
    'Negombo',
    'Colombo',
    'Gampaha',
    'Katunayake',
    'Ja-Ela',
    'Wattala',
    'Kelaniya',
    'Panadura',
    'Kalutara',
    'Kandy',
    'Galle'
  ];

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    setLocationDropdownOpen(false);
    setSearchModalOpen(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isDriver) return '/driver/dashboard';
    if (isProvider) return '/provider/dashboard';
    return '/dashboard';
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearchInput.trim()) {
      setSearchModalOpen(false);
      navigate(`/services?search=${encodeURIComponent(quickSearchInput)}&city=${currentCity}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* 1. Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <Logo size="md" />
          </div>

          {/* 2. Center: Clean Navigation Links (Home, Services, Providers, About, Contact) */}
          <nav className="hidden lg:flex items-center gap-1 font-semibold text-[13px] text-slate-700">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full transition-all ${
                location.pathname === '/'
                  ? 'text-emerald-700 bg-emerald-50/80 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Home
            </Link>

            <Link
              to="/services"
              className={`px-4 py-2 rounded-full transition-all ${
                location.pathname.startsWith('/services') && !location.search.includes('tab=providers')
                  ? 'text-emerald-700 bg-emerald-50/80 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Services
            </Link>

            <Link
              to="/services?tab=providers"
              className={`px-4 py-2 rounded-full transition-all ${
                location.pathname.startsWith('/services') && location.search.includes('tab=providers')
                  ? 'text-emerald-700 bg-emerald-50/80 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Providers
            </Link>

            {/* Dedicated Differentiator: Drive My Vehicle */}
            <Link
              to="/drivers"
              className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-xs font-bold ${
                location.pathname.startsWith('/drivers')
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-emerald-600" />
              <span>Drive My Vehicle</span>
            </Link>

            <Link
              to="/about"
              className={`px-4 py-2 rounded-full transition-all ${
                location.pathname === '/about'
                  ? 'text-emerald-700 bg-emerald-50/80 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`px-4 py-2 rounded-full transition-all ${
                location.pathname === '/contact'
                  ? 'text-emerald-700 bg-emerald-50/80 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* 3. Right: Location Pill, Search Icon, Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* Location Selector Pill (Negombo ⌵) */}
            <div className="relative hidden sm:block" ref={locationRef}>
              <button
                type="button"
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{currentCity}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {locationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Your City
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {locations.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setCurrentCity(city);
                          setLocationDropdownOpen(false);
                          if (location.pathname.startsWith('/services')) {
                            navigate(`/services?city=${city}`);
                          }
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                          currentCity === city
                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Icon Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="p-2 sm:p-2.5 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Quick Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Auth States */}
            {isAuthenticated ? (
              <>
                {/* Notifications Button */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2.5 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Panel */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-emerald-700 hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.link) navigate(n.link);
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                                !n.read ? 'bg-emerald-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-slate-900 leading-tight">
                                  {n.title}
                                </span>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <span className="hidden sm:block font-bold text-xs text-slate-900 truncate max-w-[100px]">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-1.5 z-50">
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1 text-xs font-semibold text-slate-700">
                        <Link
                          to={getDashboardPath()}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          to="/bookings"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Bookings</span>
                        </Link>

                        <Link
                          to="/messages"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <span>Messages</span>
                        </Link>

                        {isCustomer && (
                          <Link
                            to="/vehicles"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            <Car className="w-4 h-4 text-slate-400" />
                            <span>My Vehicles</span>
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors text-emerald-700 font-bold"
                          >
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <span>Admin Portal</span>
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Profile & Settings</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Reference unauthenticated buttons: Login (outline) & Sign Up (solid green pill) */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-800 hover:text-emerald-700 border border-slate-300 hover:border-slate-400 bg-white transition-all shadow-2xs"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-6 space-y-2">
            <Link
              to="/"
              className="block px-3 py-2 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              to="/services"
              className="block px-3 py-2 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-100"
            >
              Services
            </Link>
            <Link
              to="/services?tab=providers"
              className="block px-3 py-2 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-100"
            >
              Providers
            </Link>
            <Link
              to="/drivers"
              className="flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-sm text-emerald-800 bg-emerald-50 border border-emerald-200"
            >
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" />
                Drive My Vehicle
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                New
              </span>
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-100"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-100"
            >
              Contact
            </Link>
            <Link
              to="/become-provider"
              className="block px-3 py-2 rounded-xl font-semibold text-sm text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/60 font-bold"
            >
              Become a Service Provider
            </Link>
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 overflow-hidden">
            <form onSubmit={handleQuickSearch} className="flex items-center gap-3">
              <Search className="w-5 h-5 text-emerald-600 shrink-0" />
              <input
                type="text"
                autoFocus
                value={quickSearchInput}
                onChange={(e) => setQuickSearchInput(e.target.value)}
                placeholder="What service do you need? (e.g. Plumber, Driver, AC Repair)..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
              />
              <Button type="submit" variant="primary" size="sm" className="rounded-full px-5">
                Search
              </Button>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
