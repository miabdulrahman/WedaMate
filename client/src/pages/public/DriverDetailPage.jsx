import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Car,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Key,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowLeft,
  Check,
  AlertCircle,
  Plus
} from 'lucide-react';
import driverService from '../../services/driverService.js';
import reviewService from '../../services/reviewService.js';
import bookingService from '../../services/bookingService.js';
import vehicleService from '../../services/vehicleService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Rating from '../../components/ui/Rating.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import { Loader, ErrorState } from '../../components/ui/FeedbackStates.jsx';

export const DriverDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myVehicles, setMyVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dedicated "Drive My Vehicle" Booking Wizard State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [rateType, setRateType] = useState('hourly'); // 'hourly' | 'half_day' | 'full_day'
  const [durationHours, setDurationHours] = useState(4);
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');

  // Customer Vehicle Specs
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [transmission, setTransmission] = useState('automatic');
  const [vehicleNickname, setVehicleNickname] = useState('');
  const [vehicleRegistration, setVehicleRegistration] = useState('');

  // Trip Specs
  const [pickupAddress, setPickupAddress] = useState('74 Beach Road, Negombo');
  const [pickupCity, setPickupCity] = useState('Negombo');
  const [pickupDistrict, setPickupDistrict] = useState('Gampaha');
  const [destinationAddress, setDestinationAddress] = useState('Bandaranaike International Airport (BIA)');
  const [additionalStops, setAdditionalStops] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState([
    'Experienced highway driver'
  ]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        setError(null);
        const d = await driverService.getDriverById(id);
        setDriver(d);

        if (d?.user?._id) {
          const revRes = await reviewService.getProviderReviews(d.user._id);
          setReviews(revRes.reviews || []);
        }

        if (isAuthenticated) {
          const vList = await vehicleService.getMyVehicles();
          setMyVehicles(vList);
          if (vList.length > 0) {
            setSelectedVehicleId(vList[0]._id);
            setVehicleType(vList[0].vehicleType);
            setTransmission(vList[0].transmission);
            setVehicleNickname(vList[0].nickname);
            setVehicleRegistration(vList[0].registrationNumber || '');
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load driver profile');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [id, isAuthenticated]);

  // Recalculate Drive My Vehicle price
  useEffect(() => {
    const calculate = async () => {
      if (!driver) return;
      try {
        const res = await bookingService.calculatePrice({
          bookingType: 'driver',
          driverId: driver.user?._id || driver._id,
          rateType,
          durationHours: rateType === 'hourly' ? durationHours : 1
        });
        setPriceBreakdown(res);
      } catch (err) {
        console.warn('Driver rate calculation:', err);
      }
    };
    if (bookingModalOpen) {
      calculate();
    }
  }, [bookingModalOpen, rateType, durationHours, driver]);

  const handleSavedVehicleSelect = (e) => {
    const vId = e.target.value;
    setSelectedVehicleId(vId);
    const chosen = myVehicles.find((v) => v._id === vId);
    if (chosen) {
      setVehicleType(chosen.vehicleType);
      setTransmission(chosen.transmission);
      setVehicleNickname(chosen.nickname);
      setVehicleRegistration(chosen.registrationNumber || '');
    }
  };

  const toggleRequirement = (req) => {
    if (specialRequirements.includes(req)) {
      setSpecialRequirements(specialRequirements.filter((r) => r !== req));
    } else {
      setSpecialRequirements([...specialRequirements, req]);
    }
  };

  const handleDriverBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/drivers/${id}`);
      return;
    }

    if (!scheduledDate || !startTime || !pickupAddress) {
      showToast('Please specify scheduled date, time, and pickup address', 'error');
      return;
    }

    try {
      setBookingSubmitting(true);
      const stopsArray = additionalStops
        ? additionalStops.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const booking = await bookingService.createBooking({
        providerId: driver.user._id,
        bookingType: 'driver',
        scheduledDate,
        startTime,
        durationHours: rateType === 'hourly' ? durationHours : rateType === 'half_day' ? 5 : 10,
        driverDetails: {
          rateType,
          vehicleType,
          transmission,
          vehicleRegistration,
          vehicleNickname: vehicleNickname || `${vehicleType} (${transmission})`,
          driverRequirements: specialRequirements,
          additionalStops: stopsArray,
          pickupLocation: {
            address: pickupAddress,
            city: pickupCity,
            district: pickupDistrict
          },
          destinationLocation: {
            address: destinationAddress,
            city: pickupCity,
            district: pickupDistrict
          }
        },
        location: {
          address: pickupAddress,
          city: pickupCity,
          district: pickupDistrict
        },
        notes: specialInstructions
      });

      showToast('Driver hire request sent! Your driver will confirm shortly.', 'success');
      setBookingModalOpen(false);
      navigate(`/bookings/${booking._id}`);
    } catch (err) {
      showToast(err.message || 'Failed to request driver', 'error');
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading driver profile..." size="lg" className="min-h-screen" />;
  }

  if (error || !driver) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState message={error || 'Driver profile not found'} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const dUser = driver.user || {};
  const isVerified = driver.licenseVerificationStatus === 'verified';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back to Drivers Portal */}
      <Link
        to="/drivers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Drive My Vehicle Portal</span>
      </Link>

      {/* Driver Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={dUser.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'}
                alt={dUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-100 shadow-md"
              />
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-xs" title="Verified License">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{dUser.name}</h1>
                <Badge variant="verified" size="xs">
                  Verified Driver
                </Badge>
              </div>

              <p className="text-sm font-bold text-slate-700 mt-0.5">
                {driver.drivingExperienceYears} Years Professional Driving Experience
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  {driver.transmissionSkills === 'both'
                    ? 'Manual & Automatic Expert'
                    : `${driver.transmissionSkills?.toUpperCase()} Transmission`}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {driver.serviceAreas?.[0]?.city || dUser.address?.city || 'Sri Lanka'}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            icon={Car}
            onClick={() => setBookingModalOpen(true)}
            className="w-full md:w-auto font-bold shadow-md shadow-emerald-900/20"
          >
            Hire for Your Vehicle
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Customer Rating</span>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <strong className="text-base text-slate-900">{Number(driver.rating || 5.0).toFixed(1)}</strong>
              <span className="text-xs text-slate-500">({driver.reviewCount || 0})</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Completed Trips</span>
            <strong className="text-base text-slate-900 block mt-1">{driver.completedJobs || 0} Trips</strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Driving Skill</span>
            <strong className="text-base text-emerald-600 block mt-1">{Number(driver.drivingSkillScore || 4.9).toFixed(1)} / 5.0</strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Hourly Rate</span>
            <strong className="text-base text-slate-900 block mt-1">
              LKR {driver.hourlyRate?.toLocaleString()} / hr
            </strong>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3">About Driver & Experience</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {driver.bio || 'Experienced private chauffeur committed to safe, careful, and courteous driving in your private vehicle.'}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Languages:</span>
              <span>{driver.languages?.join(', ') || 'Sinhala, English'}</span>
            </div>
          </Card>

          {/* Specialties & Experience Categories */}
          {driver.specialties?.length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 text-base mb-3">Driving Specialties</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {driver.specialties.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Customer Reviews */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-base">
                Passenger Reviews ({reviews.length})
              </h3>
              <Rating value={driver.rating || 5} size="sm" />
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No reviews submitted yet.</p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between mb-1">
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

        {/* Right Sidebar: Rate Card & Trust Guarantee */}
        <div className="space-y-6">
          <Card className="p-6 bg-slate-900 text-white border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Transparent Pricing Rules
            </span>
            <h3 className="text-lg font-extrabold text-white mb-4">Rate Structure</h3>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-300">Hourly Rate</span>
                <strong className="text-white text-sm">LKR {driver.hourlyRate?.toLocaleString()} / hr</strong>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-300">Half-Day (up to 5 hrs)</span>
                <strong className="text-white text-sm">LKR {driver.halfDayRate?.toLocaleString()}</strong>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-300">Full-Day (up to 10 hrs)</span>
                <strong className="text-white text-sm">LKR {driver.fullDayRate?.toLocaleString()}</strong>
              </div>
            </div>

            <Button
              variant="secondary"
              size="md"
              className="w-full font-bold"
              onClick={() => setBookingModalOpen(true)}
            >
              Hire Driver Now
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Vehicle Comfort Guarantee</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Driver operates strictly within your speed & route preferences.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Complete care taken of automatic hybrid systems and manual clutches.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Punctual arrival at your private garage or designated pickup spot.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* DEDICATED DRIVE MY VEHICLE BOOKING WIZARD MODAL */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Hire ${dUser.name} for YOUR Vehicle`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleDriverBookingSubmit} className="space-y-5">
          {/* Section 1: Your Vehicle Information */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-emerald-700" />
              1. Your Vehicle Details (Customer-Owned)
            </h4>

            {myVehicles.length > 0 && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Select from My Vehicles</label>
                <select
                  value={selectedVehicleId}
                  onChange={handleSavedVehicleSelect}
                  className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                >
                  {myVehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.nickname} ({v.brand} {v.model} - {v.transmission?.toUpperCase()})
                    </option>
                  ))}
                  <option value="">Enter a different vehicle...</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Vehicle Type *</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="car">Car / Sedan / Hatchback</option>
                  <option value="suv">SUV / Crossover</option>
                  <option value="van">Passenger Van</option>
                  <option value="pickup">Pickup / Double-Cab</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Transmission *</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Reg Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. WP CAB-1234"
                  value={vehicleRegistration}
                  onChange={(e) => setVehicleRegistration(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Rate Type & Schedule */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              2. Schedule & Pricing Model
            </h4>

            {/* Pricing Model Pills */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hourly', label: 'Hourly', sub: `LKR ${driver.hourlyRate}/hr` },
                { id: 'half_day', label: 'Half-Day (5h)', sub: `LKR ${driver.halfDayRate}` },
                { id: 'full_day', label: 'Full-Day (10h)', sub: `LKR ${driver.fullDayRate}` }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setRateType(m.id)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    rateType === m.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold block">{m.label}</span>
                  <span className="text-[10px] opacity-75">{m.sub}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Date *</label>
                <Input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Start Time *</label>
                <Input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              {rateType === 'hourly' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Hours Needed</label>
                  <Input
                    type="number"
                    min="1"
                    max="16"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Trip Location & Stops */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              3. Trip & Itinerary
            </h4>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Pickup Location Address *</label>
              <Input
                required
                placeholder="e.g. 74 Beach Road, Negombo"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Primary Destination</label>
                <Input
                  placeholder="e.g. BIA Airport / Colombo 03"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Additional Stops (Comma separated)</label>
                <Input
                  placeholder="e.g. Ja-Ela exit, Katunayake round"
                  value={additionalStops}
                  onChange={(e) => setAdditionalStops(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Driver Requirements */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 block">Driver Special Requirements</label>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                'Experienced highway driver',
                'Night driving',
                'Long-distance experience',
                'Elderly passenger assistance',
                'Wedding/event driving',
                'Professional/business driving'
              ].map((req) => (
                <button
                  key={req}
                  type="button"
                  onClick={() => toggleRequirement(req)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                    specialRequirements.includes(req)
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {specialRequirements.includes(req) ? '✓ ' : '+ '}
                  {req}
                </button>
              ))}
            </div>
          </div>

          {/* Transparent Rate Breakdown Box */}
          {priceBreakdown && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Driver Service Rate ({rateType.replace('_', ' ')}):</span>
                <span>LKR {priceBreakdown.serviceAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Service & Safety Fee:</span>
                <span>LKR {priceBreakdown.baseFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
                <span>Total Estimated Cost:</span>
                <span className="text-emerald-700 font-extrabold">
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
              size="md"
              isLoading={bookingSubmitting}
              className="font-bold"
            >
              Hire Driver for My Vehicle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DriverDetailPage;
