import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Car, DollarSign, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export const BecomeProviderPage = () => {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="emerald" size="sm" className="mb-3">Partner with WedaMate</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Earn on Your Terms as a Local Professional or Driver
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
            Connect with thousands of customers across Negombo, Colombo, Gampaha, and Western Province. Keep up to 90% of every completed job.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg" className="font-bold">
              Register as Provider or Driver Today
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Track 1: Service Provider */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Trade & Home Service Professionals</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Plumbers, electricians, AC mechanics, house painters, carpenters, and cleaners. Receive direct booking requests, submit quotes on custom customer tasks, and grow your local client base.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero upfront listing fees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Set your own rates and service radius</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Manage availability calendar in real time</span>
              </li>
            </ul>
          </div>

          {/* Track 2: Dedicated Driver */}
          <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Drive My Vehicle Drivers</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              You do NOT need your own car. Customers provide the vehicle! Chauffeur clients on hourly errands, airport transfers, and outstation trips using your valid driving license.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No car maintenance or petrol expenses</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Higher hourly and full-day earnings (up to LKR 10,000/day)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant "Available for bookings" toggle</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeProviderPage;
