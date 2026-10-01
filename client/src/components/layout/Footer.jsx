import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin } from 'lucide-react';
import Logo from '../ui/Logo.jsx';

export const Footer = () => {
  return (
    <footer className="bg-[#0c1613] text-[#a8b8b1] pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          <div className="col-span-2 space-y-5">
            <Logo size="md" theme="dark" />

            <p className="text-sm leading-relaxed max-w-sm text-[#8a9e96]">
              Sri Lanka&apos;s trusted local services marketplace — vetted professionals and drivers for your own vehicle.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#8a9e96]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#5dcaa8]" />
                Verified professionals
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#5dcaa8]" />
                Negombo & islandwide
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-white font-semibold text-sm mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-[#5dcaa8] transition-colors">Home</Link></li>
              <li><Link to="/services" className="hover:text-[#5dcaa8] transition-colors">Services</Link></li>
              <li><Link to="/services?tab=providers" className="hover:text-[#5dcaa8] transition-colors">Providers</Link></li>
              <li><Link to="/about" className="hover:text-[#5dcaa8] transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-[#5dcaa8] transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-white font-semibold text-sm mb-4">
              For you
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/services" className="hover:text-[#5dcaa8] transition-colors">Find a service</Link></li>
              <li><Link to="/drivers" className="hover:text-[#5dcaa8] transition-colors">Hire a driver</Link></li>
              <li><Link to="/become-provider" className="hover:text-[#5dcaa8] transition-colors">Become a provider</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#5dcaa8] transition-colors">How it works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-white font-semibold text-sm mb-4">
              Providers
            </h4>
            <ul className="space-y-2.5 text-sm mb-6">
              <li><Link to="/provider/dashboard" className="hover:text-[#5dcaa8] transition-colors">Dashboard</Link></li>
              <li><Link to="/become-provider" className="hover:text-[#5dcaa8] transition-colors">List a service</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#5dcaa8] transition-colors">Verification</Link></li>
            </ul>

            <div className="flex items-center gap-2">
              {['facebook', 'instagram', 'twitter', 'linkedin'].map((network) => (
                <a
                  key={network}
                  href={`#${network}`}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[var(--primary)] hover:text-white flex items-center justify-center transition-all text-[#8a9e96]"
                  aria-label={network}
                >
                  <span className="sr-only">{network}</span>
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    {network === 'facebook' && (
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    )}
                    {network === 'instagram' && (
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    )}
                    {network === 'twitter' && (
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    )}
                    {network === 'linkedin' && (
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b7f77]">
          <p>© {new Date().getFullYear()} WedaMate. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-[#a8b8b1] transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-[#a8b8b1] transition-colors">Terms</a>
            <a href="#cookies" className="hover:text-[#a8b8b1] transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
