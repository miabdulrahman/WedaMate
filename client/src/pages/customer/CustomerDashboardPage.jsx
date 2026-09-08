import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Car,
  Search,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import bookingService from '../../services/bookingService.js';
import providerService from '../../services/providerService.js';
import BookingCard from '../../components/cards/BookingCard.jsx';
import ProviderCard from '../../components/cards/ProviderCard.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Skeleton, EmptyState } from '../../components/ui/FeedbackStates.jsx';

export const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [recommendedProviders, setRecommendedProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [bRes, pRes] = await Promise.all([
          bookingService.getBookings({ limit: 4 }),
          providerService.getProviders({ limit: 3, sort: 'recommended' })
        ]);
        setBookings(bRes.bookings || []);
        setRecommendedProviders(pRes.providers || []);
      } catch (err) {
        console.error('Customer dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'accepted' || b.status === 'confirmed' || b.status === 'in_progress'
  );
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="emerald" size="xs" className="mb-2">
            Customer Hub
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
            Manage your service requests, schedule personal drivers for your vehicle, and review active local jobs.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/services">
              <Button variant="secondary" size="sm" icon={Search} className="font-bold">
                Find a Service
              </Button>
            </Link>
            <Link to="/drivers">
              <Button variant="accent" size="sm" icon={Car} className="font-bold">
                Hire a Driver
              </Button>
            </Link>
            <Link to="/post-task">
              <Button variant="outline" size="sm" icon={PlusCircle} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Post a Task
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Active / Upcoming
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {upcomingBookings.length}
            </span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Completed Jobs
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {completedCount}
            </span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Total Requests
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {bookings.length}
            </span>
          </div>
        </Card>
      </div>

      {/* Upcoming Bookings Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Upcoming & Active Jobs</h3>
            <p className="text-xs text-slate-500">Track current jobs in progress or awaiting provider arrival</p>
          </div>
          <Link to="/bookings" className="text-xs font-bold text-emerald-700 hover:underline">
            View All Bookings →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
        ) : upcomingBookings.length === 0 ? (
          <EmptyState
            title="No active bookings"
            description="You don't have any pending or active jobs right now."
            actionLabel="Discover Local Services"
            onAction={() => (window.location.href = '/services')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.map((b) => (
              <BookingCard key={b._id} booking={b} currentRole="customer" />
            ))}
          </div>
        )}
      </div>

      {/* Recommended Providers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Recommended for You</h3>
            <p className="text-xs text-slate-500">Top-rated professionals near {user?.address?.city || 'your area'}</p>
          </div>
          <Link to="/services" className="text-xs font-bold text-emerald-700 hover:underline">
            Explore All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedProviders.map((p) => (
            <ProviderCard key={p._id} provider={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
