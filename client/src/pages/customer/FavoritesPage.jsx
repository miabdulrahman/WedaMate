import React, { useState, useEffect } from 'react';
import { Heart, Star, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { Skeleton, EmptyState } from '../../components/ui/FeedbackStates.jsx';

export const FavoritesPage = () => {
  const [savedProviders, setSavedProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoading(true);
        const res = await apiClient('/users/saved-providers');
        setSavedProviders(res.data?.savedProviders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Providers</h1>
        <p className="text-xs text-slate-500 mt-0.5">Quickly access your preferred local professionals and drivers</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : savedProviders.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved providers"
          description="Bookmark top-rated plumbers, electricians, and drivers for fast re-booking."
          actionLabel="Explore Services"
          onAction={() => (window.location.href = '/services')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProviders.map((p) => {
            const profile = p.providerProfile || p.driverProfile;
            return (
              <Card key={p._id} className="p-5 border border-slate-200/90 rounded-2xl">
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={p.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                    <p className="text-xs text-emerald-800 font-semibold">{profile?.profession || 'Specialist'}</p>
                    <p className="text-[11px] text-slate-500">{p.address?.city || 'Sri Lanka'}</p>
                  </div>
                </div>

                <Link to={p.driverProfile ? `/drivers/${p.driverProfile._id}` : `/providers/${profile?._id}`}>
                  <Button variant="outline" size="xs" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
