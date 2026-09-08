import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 text-slate-800 text-3xl font-black shadow-inner">
          404
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button size="sm">
              <Home className="w-4 h-4 mr-2" />
              <span>Return Home</span>
            </Button>
          </Link>
          <Link to="/services">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              <span>Browse Services</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
