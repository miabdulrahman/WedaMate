import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Clock,
  Star,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import driverService from '../../services/driverService.js';
import bookingService from '../../services/bookingService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import BookingCard from '../../components/cards/BookingCard.jsx';
import { Skeleton } from '../../components/ui/FeedbackStates.jsx';

export const DriverDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchDriverDashboard = async () => {
    try {
      setLoading(true);
      const res = await driverService.getDashboardStats();
      setStats(res.stats || {});
      setRecentTrips(res.recentTrips || []);
      setIsAvailable(res.stats?.isAvailable !== false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverDashboard();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      const res = await driverService.toggleAvailability();
      setIsAvailable(res.isAvailable);
      showToast(
        `You are now ${res.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'} for bookings`,
        res.isAvailable ? 'success' : 'info'
      );
    } catch (err) {
      showToast(err.message || 'Failed to toggle availability', 'error');
    }
  };

  const handleTripStatusUpdate = async (id, status) => {
    try {
      await bookingService.updateBookingStatus(id, { status });
      showToast(`Trip updated to ${status}`, 'success');
      fetchDriverDashboard();
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Real-Time Availability Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="driver" size="xs">
              Drive My Vehicle Hub
            </Badge>
            <span className="text-xs text-slate-400">Driver Chauffeur Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Driver Dispatch Hub
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Accept driving bookings for customer-owned private cars, SUVs, and vans
          </p>
        </div>

        {/* Quick Toggle: Available for bookings */}
        <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl border border-white/10">
          <span className="text-xs font-bold text-white">Available for Bookings</span>
          <button
            type="button"
            onClick={handleToggleAvailability}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              isAvailable
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-slate-950 animate-ping' : 'bg-slate-400'}`} />
            <span>{isAvailable ? 'ACTIVE (Online)' : 'OFFLINE'}</span>
          </button>
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
              Driver Earnings
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block mt-1">
              LKR {stats?.totalEarnings?.toLocaleString() || '0'}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
              From completed driving jobs
            </span>
          </Card>

          <Card className="p-5 bg-white border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Trip Requests
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-amber-600 block mt-1">
              {stats?.pendingRequests || 0}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Awaiting your response</span>
          </Card>

          <Card className="p-5 bg-white border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Completed Trips
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block mt-1">
              {stats?.completedTrips || 0}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Driving skill score: {Number(stats?.drivingSkillScore || 4.9).toFixed(1)}/5
            </span>
          </Card>

          <Card className="p-5 bg-white border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Hourly Rate
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block mt-1">
              LKR {stats?.hourlyRate?.toLocaleString() || '1,200'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Half-day: LKR {stats?.halfDayRate?.toLocaleString()}
            </span>
          </Card>
        </div>
      )}

      {/* Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">Upcoming Driving Requests</h3>
          <Link to="/bookings" className="text-xs font-bold text-emerald-700 hover:underline">
            View All Trips →
          </Link>
        </div>

        {recentTrips.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No incoming driver requests right now. Keep your status Online to receive Drive My Vehicle assignments.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentTrips.map((trip) => (
              <BookingCard
                key={trip._id}
                booking={trip}
                currentRole="driver"
                onStatusUpdate={handleTripStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboardPage;
