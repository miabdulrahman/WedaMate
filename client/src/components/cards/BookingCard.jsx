import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Car, Wrench, MessageSquare, ChevronRight } from 'lucide-react';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

export const BookingCard = ({ booking, onStatusUpdate, currentRole = 'customer' }) => {
  const isDriver = booking.bookingType === 'driver';
  const otherParty = currentRole === 'customer' ? booking.provider : booking.customer;

  const statusVariantMap = {
    pending: 'warning',
    accepted: 'info',
    confirmed: 'info',
    in_progress: 'orange',
    completed: 'success',
    cancelled: 'danger',
    disputed: 'danger'
  };

  const statusLabelMap = {
    pending: 'Pending Acceptance',
    accepted: 'Accepted',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    disputed: 'Disputed'
  };

  const formattedDate = booking.scheduledDate
    ? new Date(booking.scheduledDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Date TBD';

  return (
    <Card hover className="p-5 border border-slate-200/90 rounded-2xl bg-white transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isDriver ? (
            <Badge variant="driver" size="xs" icon={Car}>
              Drive My Vehicle
            </Badge>
          ) : (
            <Badge variant="default" size="xs" icon={Wrench}>
              Local Service
            </Badge>
          )}

          <span className="text-xs text-slate-400 font-mono">
            #{booking._id?.slice(-6)}
          </span>
        </div>

        <Badge variant={statusVariantMap[booking.status] || 'default'} size="sm">
          {statusLabelMap[booking.status] || booking.status}
        </Badge>
      </div>

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h4 className="font-bold text-slate-900 text-base">
            {isDriver
              ? `Personal Driver (${booking.driverDetails?.vehicleType?.toUpperCase() || 'Car'})`
              : booking.serviceSnapshot?.title || booking.service?.title || 'Service Booking'}
          </h4>

          <p className="text-xs text-slate-500 mt-0.5">
            {currentRole === 'customer' ? 'Provider: ' : 'Customer: '}
            <strong className="text-slate-800 font-semibold">{otherParty?.name || 'Local User'}</strong>
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs text-slate-400 block">Total</span>
          <span className="text-base font-extrabold text-slate-900">
            LKR {booking.totalAmount?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Schedule and Location info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{formattedDate} at {booking.startTime}</span>
        </div>

        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{booking.location?.city || booking.location?.address}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Link to={`/bookings/${booking._id}`}>
            <Button variant="outline" size="xs">
              View Details
            </Button>
          </Link>

          <Link
            to={
              currentRole === 'driver'
                ? `/driver/messages?bookingId=${booking._id}`
                : currentRole === 'provider'
                ? `/provider/messages?bookingId=${booking._id}`
                : `/messages?bookingId=${booking._id}`
            }
          >
            <Button variant="ghost" size="xs" icon={MessageSquare}>
              Chat
            </Button>
          </Link>
        </div>

        {/* Dynamic workflow action button */}
        {currentRole !== 'customer' && booking.status === 'pending' && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => onStatusUpdate && onStatusUpdate(booking._id, 'accepted')}
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => onStatusUpdate && onStatusUpdate(booking._id, 'rejected')}
            >
              Decline
            </Button>
          </div>
        )}

        {currentRole !== 'customer' && booking.status === 'accepted' && (
          <Button
            variant="primary"
            size="xs"
            onClick={() => onStatusUpdate && onStatusUpdate(booking._id, 'in_progress')}
          >
            Start Job
          </Button>
        )}

        {currentRole !== 'customer' && booking.status === 'in_progress' && (
          <Button
            variant="secondary"
            size="xs"
            onClick={() => onStatusUpdate && onStatusUpdate(booking._id, 'completed')}
          >
            Complete Job
          </Button>
        )}

        {currentRole === 'customer' && booking.status === 'completed' && !booking.hasReview && (
          <Link to={`/bookings/${booking._id}#review`}>
            <Button variant="secondary" size="xs">
              Leave Review
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};

export default BookingCard;
