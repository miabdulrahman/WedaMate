import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  CheckCircle,
  Star,
  Clock,
  Briefcase,
  ShieldCheck,
  Calendar,
  DollarSign,
  MessageSquare,
  ArrowLeft,
  Check,
  Phone,
  Mail
} from 'lucide-react';
import providerService from '../../services/providerService.js';
import reviewService from '../../services/reviewService.js';
import bookingService from '../../services/bookingService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Rating from '../../components/ui/Rating.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import { Loader, ErrorState } from '../../components/ui/FeedbackStates.jsx';

export const ProviderDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [durationHours, setDurationHours] = useState(2);
  const [address, setAddress] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || 'Negombo');
  const [district, setDistrict] = useState(user?.address?.district || 'Gampaha');
  const [notes, setNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true);
        setError(null);
        const p = await providerService.getProviderById(id);
        setProvider(p);

        if (p?.user?._id) {
          const revRes = await reviewService.getProviderReviews(p.user._id);
          setReviews(revRes.reviews || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load provider profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [id]);

  // Recalculate price when booking modal is active
  useEffect(() => {
    const calculate = async () => {
      if (!provider) return;
      try {
        const res = await bookingService.calculatePrice({
          bookingType: 'service',
          serviceId: selectedServiceId || undefined,
          durationHours
        });
        setPriceBreakdown(res);
      } catch (err) {
        console.warn('Calculation error:', err);
      }
    };
    if (bookingModalOpen) {
      calculate();
    }
  }, [bookingModalOpen, selectedServiceId, durationHours, provider]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/providers/${id}`);
      return;
    }

    if (!scheduledDate || !startTime || !address) {
      showToast('Please fill in scheduled date, time, and address', 'error');
      return;
    }

    try {
      setBookingSubmitting(true);
      const booking = await bookingService.createBooking({
        providerId: provider.user._id,
        bookingType: 'service',
        serviceId: selectedServiceId || undefined,
        scheduledDate,
        startTime,
        durationHours,
        location: {
          address,
          city,
          district
        },
        notes
      });

      showToast('Booking request submitted! The provider has been notified.', 'success');
      setBookingModalOpen(false);
      navigate(`/bookings/${booking._id}`);
    } catch (err) {
      showToast(err.message || 'Failed to submit booking', 'error');
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading provider details..." size="lg" className="min-h-screen" />;
  }

  if (error || !provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState message={error || 'Provider not found'} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const pUser = provider.user || {};
  const isVerified = provider.verificationStatus === 'verified';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back link */}
      <Link
        to="/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Services</span>
      </Link>

      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={pUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'}
              alt={pUser.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-100 shadow-md"
            />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{pUser.name}</h1>
                {isVerified && (
                  <Badge variant="verified" size="xs" icon={ShieldCheck}>
                    Verified Professional
                  </Badge>
                )}
              </div>

              <p className="text-sm font-bold text-emerald-800 mt-0.5">
                {provider.businessName || provider.profession}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {provider.serviceAreas?.[0]?.city || pUser.address?.city || 'Sri Lanka'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Responds within {provider.responseTimeMinutes || 15} mins
                </span>
              </div>
            </div>
          </div>

          {/* Quick CTAs */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setBookingModalOpen(true)}
              className="flex-1 md:flex-none font-bold"
            >
              Book Service Now
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Rating</span>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <strong className="text-base text-slate-900">{Number(provider.rating || 5.0).toFixed(1)}</strong>
              <span className="text-xs text-slate-500">({provider.reviewCount || 0})</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Completed</span>
            <strong className="text-base text-slate-900 block mt-1">{provider.jobsCompleted || 0} Jobs</strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Reliability</span>
            <strong className="text-base text-emerald-600 block mt-1">{provider.completionRate || 99}%</strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Starting At</span>
            <strong className="text-base text-slate-900 block mt-1">
              LKR {provider.startingPrice?.toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Details: About, Service Areas, Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3">About the Professional</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {provider.bio || 'Experienced local service professional dedicated to quality craftsmanship and prompt on-site execution.'}
            </p>

            {provider.languages?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Languages spoken:</span>
                <span>{provider.languages.join(', ')}</span>
              </div>
            )}
          </Card>

          {/* Subcategories & Skills */}
          {provider.subcategories?.length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 text-base mb-3">Specialized Services</h3>
              <div className="flex flex-wrap gap-2">
                {provider.subcategories.map((sub, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    {sub}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Customer Reviews */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-base">
                Customer Reviews ({reviews.length})
              </h3>
              <Rating value={provider.rating || 5} size="sm" />
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No customer reviews yet.</p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        {rev.customer?.name || 'Verified Customer'}
                      </span>
                      <Rating value={rev.rating} size="xs" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar: Areas, Working Hours, Quick Booking CTA */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Service Areas Covered</h3>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-600">
              {provider.serviceAreas?.map((area, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium"
                >
                  {area.city}, {area.district}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 text-white border-slate-800">
            <h3 className="font-bold text-white text-sm mb-2">Ready to get the job done?</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Lock in your preferred date and time slot. No advance fees until confirmation.
            </p>
            <Button
              variant="secondary"
              size="md"
              className="w-full font-bold"
              onClick={() => setBookingModalOpen(true)}
            >
              Request Booking
            </Button>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Book Service with ${pUser.name}`}
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Scheduled Date *</label>
            <Input
              type="date"
              required
              value={scheduledDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Start Time *</label>
              <Input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Hours</label>
              <Input
                type="number"
                min="1"
                max="12"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Street Address *</label>
            <Input
              required
              placeholder="e.g. 45 Porutota Road"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">District</label>
              <Input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Special Instructions or Notes</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what needs to be repaired..."
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Pricing breakdown box */}
          {priceBreakdown && (
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Base Service Amount:</span>
                <span>LKR {priceBreakdown.serviceAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Booking Fee:</span>
                <span>LKR {priceBreakdown.baseFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-slate-200">
                <span>Estimated Customer Total:</span>
                <span className="text-emerald-700 font-extrabold text-sm">
                  LKR {priceBreakdown.customerTotal?.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={bookingSubmitting}
              className="font-bold"
            >
              Request Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderDetailPage;
