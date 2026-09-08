import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Compass, ArrowRight, ShieldCheck, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';

export const AboutPage = () => {
  return (
    <div className="bg-white">
      {/* 1. HERO SECTION */}
      <section className="py-14 sm:py-20 border-b border-slate-100 bg-gradient-to-b from-[#f4fbf8] via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <span>About WedaMate</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Local Services. <br />
                <span className="text-emerald-600">Made Easy.</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                WedaMate is a local service marketplace that connects customers with trusted service providers in their area. We make it easier to find, book, and manage local services — from home repairs and maintenance to specialized personal drivers for your own vehicle.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 max-w-md">
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-2xl font-black text-emerald-700 block">10,000+</span>
                  <span className="text-xs text-slate-600 font-medium">Jobs Completed in Sri Lanka</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100">
                  <span className="text-2xl font-black text-teal-700 block">500+</span>
                  <span className="text-xs text-slate-600 font-medium">Verified Professionals</span>
                </div>
              </div>
            </div>

            {/* Right Photo */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-4/3 sm:aspect-square bg-slate-100">
                <img
                  src="/images/about-worker.jpg"
                  alt="WedaMate Certified Professional in Sri Lanka"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MISSION & VISION SECTION */}
      <section className="py-16 sm:py-20 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Our Mission */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To empower local communities by providing a trusted, convenient, and reliable platform for local services. We champion transparent pricing, authentic customer reviews, and respectable livelihood opportunities for skilled Sri Lankan tradespeople and drivers.
              </p>
            </div>

            {/* Our Vision */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Make finding trusted local services simple, accessible, and safe across every district in Sri Lanka. From urban hubs like Colombo and Negombo to provincial towns, WedaMate aims to be the gold standard in doorstep service reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. JOIN OUR GROWING COMMUNITY BANNER */}
      <section className="py-16 sm:py-20 bg-emerald-700 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Join Our Growing Community
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Be part of a trusted platform connecting people and local service providers across Sri Lanka.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-lg transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/become-provider"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-emerald-800/80 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold border border-emerald-600 transition-all"
            >
              <span>Earn as a Provider</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
