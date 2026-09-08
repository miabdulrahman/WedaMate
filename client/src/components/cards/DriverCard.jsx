import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Gauge, Star, Car, Award, Check } from 'lucide-react';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

export const DriverCard = ({ driver }) => {
  const user = driver?.user || {};
  const serviceAreas = driver?.serviceAreas || [];
  const primaryArea = serviceAreas[0]
    ? `${serviceAreas[0].city}`
    : user.address?.city || 'Sri Lanka';

  const transmissionLabel =
    driver?.transmissionSkills === 'both'
      ? 'Manual & Automatic'
      : driver?.transmissionSkills === 'manual'
      ? 'Manual Only'
      : 'Automatic Only';

  return (
    <Card hover className="flex flex-col h-full bg-white border border-slate-200/90 rounded-2xl p-5 group transition-all duration-200 relative overflow-hidden">
      {/* Top Banner Tag: Drive YOUR Vehicle */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold tracking-wide uppercase border border-emerald-200">
          <Car className="w-3 h-3 text-emerald-700" />
          Drives YOUR Vehicle
        </span>

        {driver?.isAvailable ? (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Available Now
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">Book in Advance</span>
        )}
      </div>

      {/* Driver Header */}
      <div className="flex items-start gap-3.5 mb-3.5">
        <div className="relative shrink-0">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'}
            alt={user.name || 'Driver'}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition-transform duration-300"
          />
          {driver?.licenseVerificationStatus === 'verified' && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm" title="License Verified">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-slate-900 text-base truncate group-hover:text-emerald-700 transition-colors">
              {user.name}
            </h4>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
            <span className="font-semibold text-slate-800">
              {driver?.drivingExperienceYears || 5} Years Experience
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{primaryArea}</span>
          </div>
        </div>
      </div>

      {/* Key Driving Credentials Box */}
      <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl mb-3.5 text-xs border border-slate-100">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Transmission
          </span>
          <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
            {transmissionLabel}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Rating & Skill
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-900">{Number(driver?.rating || 5.0).toFixed(1)}</span>
            <span className="text-slate-400 text-[11px]">({driver?.completedJobs || 0} trips)</span>
          </div>
        </div>
      </div>

      {/* Specialties Tags */}
      {driver?.specialties && driver.specialties.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-4">
          {driver.specialties.slice(0, 2).map((s, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
              <Check className="w-2.5 h-2.5 text-emerald-600" />
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Bio snippet */}
      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed flex-1">
        {driver?.bio || 'Professional chauffeur dedicated to safe, courteous driving in your private vehicle.'}
      </p>

      {/* Rates row & CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div>
          <span className="text-[11px] text-slate-500 block">Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-900">
              LKR {driver?.hourlyRate?.toLocaleString() || '1,200'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">/hr</span>
          </div>
        </div>

        <Link to={`/drivers/${driver?._id}`}>
          <Button variant="secondary" size="sm">
            Hire Driver
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default DriverCard;
