import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import bookingService from '../../services/bookingService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import BookingCard from '../../components/cards/BookingCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { Skeleton, EmptyState, ErrorState } from '../../components/ui/FeedbackStates.jsx';

export const BookingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeStatus = searchParams.get('status') || 'all';

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (activeStatus !== 'all') {
        params.status = activeStatus;
      }
      const res = await bookingService.getBookings(params);
      setBookings(res.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeStatus]);

  const handleStatusFilter = (st) => {
    const params = new URLSearchParams(searchParams);
    if (st === 'all') {
      params.delete('status');
    } else {
      params.set('status', st);
    }
    setSearchParams(params);
  };

  const handleBookingStatusUpdate = async (id, status) => {
    try {
      await bookingService.updateBookingStatus(id, { status });
      showToast(`Booking updated to ${status}`, 'success');
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to update booking status', 'error');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Bookings & Jobs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and manage your service requests and Drive My Vehicle hires
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/services">
            <Button variant="outline" size="sm">
              New Service
            </Button>
          </Link>
          <Link to="/drivers">
            <Button variant="secondary" size="sm">
              Hire Driver
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleStatusFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeStatus === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <ErrorState message={error} onRetry={fetchBookings} />}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description={
            activeStatus === 'all'
              ? 'You have not made any bookings yet.'
              : `No bookings found with status: "${activeStatus}".`
          }
          actionLabel="Book a Service Now"
          onAction={() => (window.location.href = '/services')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              currentRole={user?.role}
              onStatusUpdate={handleBookingStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
