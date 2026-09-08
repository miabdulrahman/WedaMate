import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Car,
  Wrench,
  Search,
  Filter,
  DollarSign,
  Clock,
  Eye,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import bookingService from '../../services/bookingService.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Loader, ErrorState, EmptyState } from '../../components/ui/FeedbackStates.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminBookingsPage = () => {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, booking: null, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookings({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit: 15
      });
      setBookings(res.bookings || []);
      setPagination(res.pagination || { total: 0, pages: 1 });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, typeFilter, page]);

  const handleAdminCancel = async () => {
    if (!cancelModal.booking) return;
    try {
      setActionLoading(true);
      await bookingService.updateBookingStatus(cancelModal.booking._id, {
        status: 'cancelled',
        cancellationReason: cancelModal.reason || 'Cancelled by WedaMate administrator'
      });
      toast.success('Booking cancelled successfully');
      setCancelModal({ isOpen: false, booking: null, reason: '' });
      fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" size="xs">Completed</Badge>;
      case 'confirmed':
        return <Badge variant="info" size="xs">Confirmed</Badge>;
      case 'in_progress':
        return <Badge variant="warning" size="xs">In Progress</Badge>;
      case 'pending':
        return <Badge variant="neutral" size="xs">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="danger" size="xs">Cancelled</Badge>;
      case 'disputed':
        return <Badge variant="danger" size="xs">Disputed</Badge>;
      default:
        return <Badge size="xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          System Bookings Master
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete audit trail of all service requests, hourly driver dispatches, amounts, and statuses
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Booking Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Types (Services & Drivers)</option>
              <option value="driver">Drive My Vehicle (Trips)</option>
              <option value="service">Standard Services</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      {loading ? (
        <Loader text="Loading bookings records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBookings} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="No bookings match the selected filters."
        />
      ) : (
        <Card className="overflow-hidden border-slate-200/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">ID & Type</th>
                  <th className="px-4 py-3.5">Service / Trip Info</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Provider / Driver</th>
                  <th className="px-4 py-3.5">Schedule</th>
                  <th className="px-4 py-3.5">Amount (LKR)</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-[11px] text-slate-400">#{b._id.slice(-6)}</div>
                      <div className="mt-1">
                        {b.bookingType === 'driver' ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            <Car className="w-3 h-3" />
                            Drive My Vehicle
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            <Wrench className="w-3 h-3" />
                            Service
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 max-w-[180px] truncate">
                        {b.bookingType === 'driver'
                          ? `Trip: ${b.driverDetails?.pickupCity || 'Pickup'} ➔ ${b.driverDetails?.destinationCity || 'Destination'}`
                          : b.serviceSnapshot?.title || 'Home Service'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {b.bookingType === 'driver'
                          ? `${b.driverDetails?.vehicleType || 'Vehicle'} • ${b.driverDetails?.transmission || 'Auto'}`
                          : `${b.durationHours || 2} hrs duration`}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{b.customer?.name || 'Customer'}</div>
                      <div className="text-[11px] text-slate-400">{b.customer?.phone || b.customer?.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{b.provider?.name || 'Assigned'}</div>
                      <div className="text-[11px] text-slate-400">{b.provider?.phone || b.provider?.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div>{b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">{b.startTime || 'Standard'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">
                        Rs. {b.totalAmount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        Fee: Rs. {b.platformFee?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(b.status)}</td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Link
                        to={`/bookings/${b._id}`}
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                      {['pending', 'confirmed'].includes(b.status) && (
                        <button
                          onClick={() => setCancelModal({ isOpen: true, booking: b, reason: '' })}
                          className="text-rose-600 hover:text-rose-700 font-semibold text-xs ml-2"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
              <span>
                Total: <strong className="text-slate-800">{pagination.total}</strong> bookings
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="font-semibold text-slate-800">
                  {page} / {pagination.pages}
                </span>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Admin Cancel Modal */}
      {cancelModal.isOpen && (
        <Modal
          isOpen={cancelModal.isOpen}
          onClose={() => setCancelModal({ isOpen: false, booking: null, reason: '' })}
          title="Force Cancel Booking"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to administratively cancel booking{' '}
              <strong className="text-slate-900 font-mono">#{cancelModal.booking?._id.slice(-6)}</strong>?
              Both customer and provider will be notified.
            </p>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Cancellation Reason</label>
              <textarea
                rows={3}
                value={cancelModal.reason}
                onChange={(e) => setCancelModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for cancellation..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelModal({ isOpen: false, booking: null, reason: '' })}
              >
                Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={actionLoading}
                onClick={handleAdminCancel}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminBookingsPage;
