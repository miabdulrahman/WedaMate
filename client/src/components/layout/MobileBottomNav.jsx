import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, MessageSquare, User, LayoutDashboard, Car, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const MobileBottomNav = () => {
  const { isAuthenticated, isProvider, isDriver } = useAuth();

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-[var(--border)] px-1 py-1.5 flex items-center justify-around">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold transition-all min-w-[56px] ${
                isActive ? 'text-[var(--primary)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
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
