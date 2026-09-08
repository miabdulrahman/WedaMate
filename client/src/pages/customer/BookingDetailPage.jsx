import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ArrowLeft,
  XCircle,
  Star,
  DollarSign
} from 'lucide-react';
import bookingService from '../../services/bookingService.js';
import reviewService from '../../services/reviewService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Rating from '../../components/ui/Rating.jsx';
import { Loader, ErrorState } from '../../components/ui/FeedbackStates.jsx';

export const BookingDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('poor_service');
  const [disputeDetails, setDisputeDetails] = useState('');

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [drivingSkillRating, setDrivingSkillRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookingService.getBookingById(id);
      setBooking(res.booking);
    } catch (err) {
      setError(err.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!cancelReason) {
      showToast('Please specify a cancellation reason', 'error');
      return;
    }
    try {
      await bookingService.updateBookingStatus(id, {
        status: 'cancelled',
        cancellationReason: cancelReason
      });
      showToast('Booking cancelled', 'info');
      setCancelModalOpen(false);
      fetchBooking();
    } catch (err) {
      showToast(err.message || 'Failed to cancel', 'error');
    }
  };

  const handleFileDispute = async () => {
    if (!disputeDetails) {
      showToast('Please provide dispute details', 'error');
      return;
    }
    try {
      await bookingService.openDispute(id, {
        reason: disputeReason,
        details: disputeDetails
      });
      showToast('Dispute opened. WedaMate administration alerted.', 'success');
      setDisputeModalOpen(false);
      fetchBooking();
    } catch (err) {
      showToast(err.message || 'Failed to file dispute', 'error');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment) {
      showToast('Please write a review comment', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.createReview({
        bookingId: id,
        rating: reviewRating,
        comment: reviewComment,
        subRatings: {
          quality: reviewRating,
          punctuality: punctualityRating,
          drivingSkill: booking.bookingType === 'driver' ? drivingSkillRating : undefined,
          safety: booking.bookingType === 'driver' ? 5 : undefined
        }
      });
      showToast('Thank you! Review submitted successfully.', 'success');
      setReviewModalOpen(false);
      fetchBooking();
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loader message="Loading booking details..." size="lg" className="min-h-screen" />;
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState message={error || 'Booking not found'} onRetry={fetchBooking} />
      </div>
    );
  }

  const isCustomer = user?.id === booking.customer?._id || user?.role === 'customer';
  const otherParty = isCustomer ? booking.provider : booking.customer;
  const isDriver = booking.bookingType === 'driver';

  const statusVariantMap = {
    pending: 'warning',
    accepted: 'info',
    confirmed: 'info',
    in_progress: 'orange',
    completed: 'success',
    cancelled: 'danger',
    disputed: 'danger'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Bookings</span>
      </Link>

      {/* Header Card */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono text-slate-400">Booking #{booking._id?.slice(-8)}</span>
              {isDriver ? (
                <Badge variant="driver" size="xs" icon={Car}>
                  Drive My Vehicle
                </Badge>
              ) : (
                <Badge variant="default" size="xs" icon={Wrench}>
                  Local Service
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {isDriver
                ? `Personal Driver Hire (${booking.driverDetails?.vehicleType?.toUpperCase() || 'Car'})`
                : booking.serviceSnapshot?.title || booking.service?.title || 'Service Booking'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={statusVariantMap[booking.status] || 'default'} size="md">
              {booking.status?.toUpperCase()}
            </Badge>

            <Link to="/messages">
              <Button variant="outline" size="sm" icon={MessageSquare}>
                Chat
              </Button>
            </Link>
          </div>
        </div>

        {/* Counterparty & Schedule Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Counterparty Details */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <img
              src={otherParty?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
              alt={otherParty?.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {isCustomer ? 'Service Provider / Driver' : 'Customer'}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{otherParty?.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{otherParty?.phone || 'Phone hidden for privacy'}</p>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {new Date(booking.scheduledDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Start Time: <strong>{booking.startTime}</strong> (~{booking.durationHours} hours)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{booking.location?.address}, {booking.location?.city}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Differentiator: Vehicle & Itinerary details if Drive My Vehicle */}
      {isDriver && booking.driverDetails && (
        <Card className="p-6 bg-emerald-50/50 border border-emerald-200/80">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-emerald-950 flex items-center gap-2 mb-4">
            <Car className="w-4 h-4 text-emerald-700" />
            Customer's Vehicle & Trip Itinerary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle</span>
              <strong className="text-slate-800 text-sm block mt-0.5 capitalize">
                {booking.driverDetails.vehicleNickname || booking.driverDetails.vehicleType}
              </strong>
              <span className="text-slate-500">{booking.driverDetails.vehicleRegistration || 'Unspecified reg'}</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Transmission</span>
              <strong className="text-slate-800 text-sm block mt-0.5 capitalize">
                {booking.driverDetails.transmission || 'Automatic'}
              </strong>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Rate Model</span>
              <strong className="text-slate-800 text-sm block mt-0.5 capitalize">
                {booking.driverDetails.rateType?.replace('_', ' ') || 'Hourly'}
              </strong>
            </div>
          </div>

          {booking.driverDetails.driverRequirements?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-emerald-900">Requirements:</span>
              {booking.driverDetails.driverRequirements.map((r, i) => (
                <span key={i} className="px-2 py-0.5 bg-white text-emerald-800 rounded-md text-[11px] font-medium border border-emerald-200">
                  ✓ {r}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Financials & Status Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pricing Summary */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Payment & Rates Breakdown</h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Service Fee:</span>
              <span>LKR {booking.price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform Fee & Safety:</span>
              <span>LKR {booking.platformFee?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-3 border-t border-slate-100">
              <span>Total Amount:</span>
              <span className="text-emerald-700 font-extrabold text-base">
                LKR {booking.totalAmount?.toLocaleString()}
              </span>
            </div>
            <div className="pt-2 text-[11px] text-slate-500">
              Payment Status: <strong className="capitalize text-slate-800">{booking.paymentStatus}</strong>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Status Timeline</h3>
          <div className="space-y-4 text-xs">
            {booking.statusTimeline?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-1 ring-4 ring-emerald-100" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-800 capitalize font-bold">{item.status?.replace('_', ' ')}</strong>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {item.note && <p className="text-slate-500 mt-0.5">{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Action Footers */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <Button variant="danger" size="xs" onClick={() => setCancelModalOpen(true)}>
              Cancel Booking
            </Button>
          )}

          <Button variant="outline" size="xs" onClick={() => setDisputeModalOpen(true)}>
            Report Issue / Dispute
          </Button>
        </div>

        {isCustomer && booking.status === 'completed' && !booking.hasReview && (
          <Button variant="secondary" size="sm" icon={Star} onClick={() => setReviewModalOpen(true)}>
            Leave Review & Rating
          </Button>
        )}
      </div>

      {/* Cancellation Modal */}
      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Booking">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel this booking? Please provide a brief explanation.
          </p>
          <textarea
            rows="3"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation..."
            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="xs" onClick={() => setCancelModalOpen(false)}>
              Keep Booking
            </Button>
            <Button variant="danger" size="xs" onClick={handleCancelBooking}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dispute Modal */}
      <Modal isOpen={disputeModalOpen} onClose={() => setDisputeModalOpen(false)} title="Open Dispute / Report">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Our admin team reviews all reported issues and will reach out to mediate.
          </p>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Reason</label>
            <select
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
            >
              <option value="no_show">Provider / Driver did not show up</option>
              <option value="poor_service">Substandard service quality</option>
              <option value="safety_issue">Safety or behavior concern</option>
              <option value="incorrect_price">Pricing or surcharge dispute</option>
              <option value="miscommunication">Miscommunication</option>
              <option value="other">Other issue</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Details *</label>
            <textarea
              rows="4"
              value={disputeDetails}
              onChange={(e) => setDisputeDetails(e.target.value)}
              placeholder="Explain exactly what happened..."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="xs" onClick={() => setDisputeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="xs" onClick={handleFileDispute}>
              Submit Dispute
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Leave Your Feedback & Rating"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Overall Rating (1 - 5 Stars)</label>
            <div className="flex items-center gap-1">
              <Rating value={reviewRating} interactive onChange={setReviewRating} size="lg" />
            </div>
          </div>

          {isDriver && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Driving Skill & Vehicle Care (1 - 5)
              </label>
              <Rating value={drivingSkillRating} interactive onChange={setDrivingSkillRating} size="md" />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Written Review *</label>
            <textarea
              required
              rows="4"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Describe your experience with this professional..."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={submittingReview}>
              Publish Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookingDetailPage;
