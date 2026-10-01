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
  MessageSquare
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

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    setLocationDropdownOpen(false);
    setSearchModalOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifDropdownOpen(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setLocationDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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

  const navItemClass = (active) =>
    `nav-link px-3 py-2 text-[13px] font-semibold tracking-tight ${
      active ? 'nav-link-active text-[var(--primary)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-[var(--border)]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[4.25rem] flex items-center justify-between gap-4">
          <Logo size="md" />

          <nav className="hidden lg:flex items-center gap-0.5">
            <Link to="/" className={navItemClass(location.pathname === '/')}>
              Home
            </Link>
            <Link
              to="/services"
              className={navItemClass(
                location.pathname.startsWith('/services') && !location.search.includes('tab=providers')
              )}
            >
              Services
            </Link>
            <Link
              to="/services?tab=providers"
              className={navItemClass(
                location.pathname.startsWith('/services') && location.search.includes('tab=providers')
              )}
            >
              Providers
            </Link>
            <Link
              to="/drivers"
              className={`ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                location.pathname.startsWith('/drivers')
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--primary)] bg-[var(--primary-muted)] hover:bg-[#d4ebe3]'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              Drive My Vehicle
            </Link>
            <Link to="/about" className={navItemClass(location.pathname === '/about')}>
              About
            </Link>
            <Link to="/contact" className={navItemClass(location.pathname === '/contact')}>
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="relative hidden sm:block" ref={locationRef}>
              <button
                type="button"
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-white/80 hover:bg-[var(--primary-soft)] text-[var(--ink)] text-xs font-semibold transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                <span>{currentCity}</span>
                <ChevronDown className="w-3 h-3 text-[var(--ink-muted)]" />
              </button>

              {locationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[var(--border)] p-1.5 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[var(--ink-muted)] uppercase tracking-wider">
                    Select city
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
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          currentCity === city
                            ? 'bg-[var(--primary-muted)] text-[var(--primary)] font-bold'
                            : 'text-[var(--ink)] hover:bg-[var(--surface)]'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchModalOpen(true);
                setNotifDropdownOpen(false);
                setUserDropdownOpen(false);
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--primary-soft)] transition-colors cursor-pointer"
              aria-label="Quick Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {isAuthenticated ? (
              <>
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifDropdownOpen((prev) => !prev);
                      setUserDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="relative p-2 rounded-lg border border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--primary-soft)] transition-colors cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="fixed left-3 right-3 top-[4.5rem] sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-2 sm:w-96 max-w-md sm:max-w-none mx-auto sm:mx-0 bg-white rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden z-50 animate-fade-in">
                      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-[var(--ink)] text-sm">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-[var(--primary)] hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[calc(100vh-8rem)] sm:max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-[var(--ink-muted)]">
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
                              className={`p-3.5 hover:bg-[var(--surface)] transition-colors cursor-pointer text-left ${
                                !n.read ? 'bg-[var(--primary-soft)]' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-[var(--ink)] leading-tight">
                                  {n.title}
                                </span>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-[var(--ink-muted)] mt-1 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-[#8a9a93] mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={userRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen((prev) => !prev);
                      setNotifDropdownOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-[var(--primary-soft)] transition-colors cursor-pointer border border-[var(--border)]"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                      alt={user?.name}
                      className="w-7 h-7 rounded-md object-cover"
                    />
                    <span className="hidden sm:block font-semibold text-xs text-[var(--ink)] truncate max-w-[100px]">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-muted)] mr-1" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-[var(--border)] p-1.5 z-50 animate-fade-in">
                      <div className="px-3 py-2.5 border-b border-[var(--border)]">
                        <p className="text-xs font-bold text-[var(--ink)] truncate">{user?.name}</p>
                        <p className="text-[11px] text-[var(--ink-muted)] truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--primary-muted)] text-[var(--primary)] border border-[#b8dfd2]">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1 text-xs font-semibold text-[var(--ink-muted)]">
                        <Link
                          to={getDashboardPath()}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors"
                        >
                          <Briefcase className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/bookings"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          Bookings
                        </Link>
                        <Link
                          to="/messages"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Messages
                        </Link>
                        {isCustomer && (
                          <Link
                            to="/vehicles"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors"
                          >
                            <Car className="w-4 h-4" />
                            My Vehicles
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-[var(--primary)] font-bold transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Portal
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Profile & Settings
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-[var(--border)]">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-lg text-xs font-bold text-[var(--ink)] border border-[var(--border-strong)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] bg-white transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setNotifDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className="lg:hidden p-2 rounded-lg text-[var(--ink-muted)] hover:bg-[var(--primary-soft)]"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border)] bg-white px-4 pt-3 pb-5 space-y-1 animate-fade-in">
            {[
              { to: '/', label: 'Home' },
              { to: '/services', label: 'Services' },
              { to: '/services?tab=providers', label: 'Providers' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' }
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block px-3 py-2.5 rounded-lg font-semibold text-sm text-[var(--ink)] hover:bg-[var(--surface)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/drivers"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-sm text-[var(--primary)] bg-[var(--primary-muted)]"
            >
              <Car className="w-4 h-4" />
              Drive My Vehicle
            </Link>
            <Link
              to="/become-provider"
              className="block px-3 py-2.5 rounded-lg font-bold text-sm text-[var(--primary)] hover:bg-[var(--primary-soft)]"
            >
              Become a Service Provider
            </Link>
          </div>
        )}
      </header>

      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--ink)]/45 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[var(--border)] p-4">
            <form onSubmit={handleQuickSearch} className="flex items-center gap-3">
              <Search className="w-5 h-5 text-[var(--primary)] shrink-0" />
              <input
                type="text"
                autoFocus
                value={quickSearchInput}
                onChange={(e) => setQuickSearchInput(e.target.value)}
                placeholder="What service do you need?"
                className="w-full bg-transparent text-sm sm:text-base text-[var(--ink)] placeholder:text-[#8a9a93] focus:outline-none font-medium"
              />
              <Button type="submit" variant="primary" size="sm">
                Search
              </Button>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)]"
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
