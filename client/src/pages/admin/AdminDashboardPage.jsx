import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Wrench,
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  Activity,
  Award
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Loader, ErrorState } from '../../components/ui/FeedbackStates.jsx';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnalytics();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <Loader text="Loading administrative dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAnalytics} />;

  const { metrics, trends = [], popularServices = [] } = data || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              System Live • Sri Lanka Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Platform Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time operations, revenue metrics, driver dispatch, and marketplace activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/verification"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>KYC Verifications</span>
          </Link>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Commission Settings
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Gross Volume */}
        <Card className="p-5 border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Volume</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            LKR {metrics?.grossBookingValue?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Across all completed services & trips</span>
          </p>
        </Card>

        {/* Platform Revenue */}
        <Card className="p-5 border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Platform Revenue (10%)</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-900">
            LKR {metrics?.platformRevenue?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Net commission earned from service bookings
          </p>
        </Card>

        {/* Total Bookings */}
        <Card className="p-5 border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Bookings</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {metrics?.totalBookings || 0}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>{metrics?.driverBookings || 0} Driver trips</span>
            <span>•</span>
            <span>{metrics?.serviceBookings || 0} Services</span>
          </div>
        </Card>

        {/* Active Accounts */}
        <Card className="p-5 border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">User Network</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {metrics?.totalUsers || 0}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
            <span>{metrics?.activeProviders || 0} Providers</span>
            <span>•</span>
            <span>{metrics?.verifiedDrivers || 0} Verified Drivers</span>
          </div>
        </Card>
      </div>

      {/* Booking Health & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card className="p-6 border-slate-200/80 col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
            Booking Completion & Health
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Fulfilled / Completed</span>
                <span className="text-emerald-700 font-bold">{metrics?.completedBookings || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${metrics?.totalBookings ? ((metrics.completedBookings / metrics.totalBookings) * 100) : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Pending / Dispatched</span>
                <span className="text-amber-700 font-bold">{metrics?.pendingBookings || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${metrics?.totalBookings ? ((metrics.pendingBookings / metrics.totalBookings) * 100) : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Cancelled</span>
                <span className="text-rose-700 font-bold">{metrics?.cancelledBookings || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-rose-500 h-2 rounded-full"
                  style={{
                    width: `${metrics?.totalBookings ? ((metrics.cancelledBookings / metrics.totalBookings) * 100) : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Completion Rate</span>
              <Badge variant="success" size="sm">
                {metrics?.completionRate || 100}%
              </Badge>
            </div>
          </div>
        </Card>

        {/* Popular Services Table */}
        <Card className="p-6 border-slate-200/80 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Top Service Categories Demanded
            </h2>
            <Link to="/admin/categories" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              <span>View catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {popularServices.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No service booking transactions recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-2.5">Service Title</th>
                    <th className="pb-2.5 text-center">Bookings</th>
                    <th className="pb-2.5 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {popularServices.map((svc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 font-semibold text-slate-800">{svc._id || 'Specialized Task'}</td>
                      <td className="py-3 text-center">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                          {svc.bookingsCount}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        LKR {svc.totalRevenue?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all flex items-center gap-4 group"
        >
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">User Management</h3>
            <p className="text-xs text-slate-500">Suspend, activate, filter</p>
          </div>
        </Link>

        <Link
          to="/admin/drivers"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all flex items-center gap-4 group"
        >
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Drive My Vehicle</h3>
            <p className="text-xs text-slate-500">Licenses & dispatch status</p>
          </div>
        </Link>

        <Link
          to="/admin/verification"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex items-center gap-4 group"
        >
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">KYC Approvals</h3>
            <p className="text-xs text-slate-500">NIC, license & police checks</p>
          </div>
        </Link>

        <Link
          to="/admin/reports"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all flex items-center gap-4 group"
        >
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Disputes & Reports</h3>
            <p className="text-xs text-slate-500">Customer resolution queue</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
