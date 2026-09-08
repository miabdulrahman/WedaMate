import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Car,
  Heart,
  MessageSquare,
  User,
  Settings,
  Wrench,
  FileText,
  Clock,
  DollarSign,
  Shield,
  Users,
  CheckCircle,
  FolderTree,
  Star,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Sidebar = ({ role = 'customer' }) => {
  const { isCustomer, isProvider, isDriver, isAdmin } = useAuth();

  const customerLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/bookings', label: 'My Bookings', icon: Calendar },
    { to: '/vehicles', label: 'My Vehicles', icon: Car },
    { to: '/favorites', label: 'Saved Providers', icon: Heart },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/profile', label: 'Profile & Settings', icon: User }
  ];

  const providerLinks = [
    { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/provider/bookings', label: 'Jobs & Requests', icon: Calendar },
    { to: '/provider/services', label: 'My Services', icon: Wrench },
    { to: '/provider/quotes', label: 'Custom Quotes', icon: FileText },
    { to: '/provider/availability', label: 'Availability', icon: Clock },
    { to: '/provider/earnings', label: 'Earnings', icon: DollarSign },
    { to: '/provider/profile', label: 'Provider Profile', icon: User },
    { to: '/messages', label: 'Messages', icon: MessageSquare }
  ];

  const driverLinks = [
    { to: '/driver/dashboard', label: 'Dispatch Hub', icon: LayoutDashboard },
    { to: '/driver/bookings', label: 'Driving Trips', icon: Calendar },
    { to: '/driver/availability', label: 'Driving Schedule', icon: Clock },
    { to: '/driver/earnings', label: 'Driver Earnings', icon: DollarSign },
    { to: '/driver/profile', label: 'Driver Profile & License', icon: Car },
    { to: '/messages', label: 'Messages', icon: MessageSquare }
  ];

  const adminLinks = [
    { to: '/admin', label: 'Analytics Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/providers', label: 'Service Providers', icon: Wrench },
    { to: '/admin/drivers', label: 'Drive My Vehicle', icon: Car },
    { to: '/admin/verification', label: 'KYC & License Review', icon: Shield },
    { to: '/admin/bookings', label: 'All Bookings', icon: Calendar },
    { to: '/admin/categories', label: 'Categories & Catalog', icon: FolderTree },
    { to: '/admin/reviews', label: 'Review Moderation', icon: Star },
    { to: '/admin/reports', label: 'Disputes & Reports', icon: AlertTriangle },
    { to: '/admin/settings', label: 'Platform Settings', icon: Settings }
  ];

  let links = customerLinks;
  if (role === 'admin' || isAdmin) links = adminLinks;
  else if (role === 'driver' || isDriver) links = driverLinks;
  else if (role === 'provider' || isProvider) links = providerLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4.5rem)] p-4 shrink-0 hidden md:block">
      <div className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard' || link.to === '/admin' || link.to === '/provider/dashboard' || link.to === '/driver/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
