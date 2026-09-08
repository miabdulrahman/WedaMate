import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  Briefcase,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import providerService from '../../services/providerService.js';
import bookingService from '../../services/bookingService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import BookingCard from '../../components/cards/BookingCard.jsx';
import { Skeleton } from '../../components/ui/FeedbackStates.jsx';

export const ProviderDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await providerService.getDashboardStats();
      setStats(res.stats || {});
      setRecentBookings(res.recentBookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await bookingService.updateBookingStatus(id, { status });
      showToast(`Booking updated to ${status}`, 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="verified" size="xs" className="mb-1">
            Provider Portal
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Service Provider Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of your active bookings, client requests, and monthly revenue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/provider/quotes">
            <Button variant="outline" size="sm">
              View Quotes
            </Button>
          </Link>
          <Link to="/provider/services">
            <Button variant="secondary" size="sm" icon={Plus}>
              Manage Services
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Earnings
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                LKR {stats?.totalEarnings?.toLocaleString() || '0'}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
              Paid directly to your account
            </span>
          </Card>

          <Card className="p-5 bg-white border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Requests
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-amber-600 block mt-1">
              {stats?.pendingRequests || 0}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Require your response</span>
          </Card>

          <Card className="p-5 bg-white border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Completed Jobs
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block mt-1">
              {stats?.completedJobs || 0}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {stats?.completionRate || 98}% completion rate
            </span>
          </Card>

          <Card className="p-5 bg-white border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Customer Rating
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {Number(stats?.rating || 5.0).toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">({stats?.reviewCount || 0})</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Avg response: {stats?.responseTimeMinutes || 15} mins
            </span>
          </Card>
        </div>
      )}

      {/* Recent / Pending Bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">Incoming & Active Bookings</h3>
          <Link to="/provider/bookings" className="text-xs font-bold text-emerald-700 hover:underline">
            View All Jobs →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No recent booking requests. Keep your profile updated to receive new client bookings.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentBookings.map((b) => (
              <BookingCard
                key={b._id}
                booking={b}
                currentRole="provider"
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboardPage;
