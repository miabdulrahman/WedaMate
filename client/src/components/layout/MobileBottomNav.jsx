import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, MessageSquare, User, LayoutDashboard, Car, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const MobileBottomNav = () => {
  const { isAuthenticated, isProvider, isDriver, isAdmin } = useAuth();

  const customerLinks = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/services', label: 'Services', icon: Search },
    { to: '/drivers', label: 'Drivers', icon: Car },
    { to: '/bookings', label: 'Bookings', icon: Calendar },
    { to: isAuthenticated ? '/profile' : '/login', label: 'Profile', icon: User }
  ];

  const providerLinks = [
    { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/provider/bookings', label: 'Jobs', icon: Calendar },
    { to: '/provider/services', label: 'Services', icon: Wrench },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/profile', label: 'Profile', icon: User }
  ];

  const driverLinks = [
    { to: '/driver/dashboard', label: 'Hub', icon: LayoutDashboard },
    { to: '/driver/bookings', label: 'Trips', icon: Calendar },
    { to: '/driver/availability', label: 'Schedule', icon: Car },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/profile', label: 'Profile', icon: User }
  ];

  let links = customerLinks;
  if (isDriver) links = driverLinks;
  else if (isProvider) links = providerLinks;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition-all min-w-[56px] ${
                isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
