import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Search,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import providerService from '../../services/providerService.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { Loader, ErrorState, EmptyState } from '../../components/ui/FeedbackStates.jsx';

export const AdminProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await providerService.getProviders({
        search: search || undefined,
        verifiedOnly: verifiedFilter === 'verified' ? 'true' : undefined,
        limit: 50
      });
      setProviders(res.providers || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, verifiedFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Service Providers Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified contractors, plumbers, electricians, and technicians across Sri Lankan districts
          </p>
        </div>
        <Link
          to="/admin/verification"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Review Verifications</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search providers by business name, skill, or district..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="sm:col-span-4">
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Verification Statuses</option>
              <option value="verified">Verified Badge Holders</option>
              <option value="pending">Pending or Unverified</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <Loader text="Loading providers directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProviders} />
      ) : providers.length === 0 ? (
        <EmptyState
          title="No providers found"
          description="Try broadening your search term or filter criteria."
        />
      ) : (
        <Card className="overflow-hidden border-slate-200/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Provider</th>
                  <th className="px-4 py-3.5">Categories</th>
                  <th className="px-4 py-3.5">Coverage Area</th>
                  <th className="px-4 py-3.5">Performance</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providers.map((p) => {
                  const user = p.user || {};
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} name={user.name || p.businessName} size="sm" />
                          <div>
                            <div className="font-bold text-slate-900">{p.businessName || user.name}</div>
                            <div className="text-slate-400 text-[11px]">{user.email || p._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(p.categories || []).slice(0, 2).map((c, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                              {c.name || 'Service'}
                            </span>
                          ))}
                          {(p.categories?.length || 0) > 2 && (
                            <span className="text-slate-400 text-[10px]">+{p.categories.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {p.serviceAreas?.[0]?.city || user.address?.city || 'Western Province'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-900">{p.rating ? p.rating.toFixed(1) : 'New'}</span>
                          <span className="text-slate-400 text-[11px]">({p.reviewCount || 0})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={p.verificationStatus === 'verified' ? 'success' : 'warning'}
                          size="sm"
                          className="capitalize"
                        >
                          {p.verificationStatus || 'unverified'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/providers/${p._id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold text-xs"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminProvidersPage;
