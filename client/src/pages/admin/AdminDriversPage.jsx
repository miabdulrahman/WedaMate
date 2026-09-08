import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Search,
  CheckCircle,
  Star,
  ExternalLink,
  ShieldAlert,
  Gauge,
  MapPin,
  DollarSign
} from 'lucide-react';
import driverService from '../../services/driverService.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { Loader, ErrorState, EmptyState } from '../../components/ui/FeedbackStates.jsx';

export const AdminDriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [transmissionFilter, setTransmissionFilter] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await driverService.getDrivers({
        transmission: transmissionFilter || undefined,
        limit: 50
      });
      setDrivers(res.drivers || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [transmissionFilter]);

  const filteredDrivers = drivers.filter((d) => {
    if (!search) return true;
    const name = d.user?.name?.toLowerCase() || '';
    const city = d.operatingAreas?.[0]?.city?.toLowerCase() || '';
    return name.includes(search.toLowerCase()) || city.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
              Primary Differentiator
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Drive My Vehicle Drivers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered professional drivers vetted to drive customer-owned private cars, SUVs, and vans
          </p>
        </div>

        <Link
          to="/admin/verification"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>License Verifications</span>
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
              placeholder="Search driver by name or Sri Lankan location..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={transmissionFilter}
              onChange={(e) => setTransmissionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Transmissions</option>
              <option value="automatic">Automatic Only</option>
              <option value="manual">Manual Transmission</option>
              <option value="both">Both (Manual & Auto)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <Loader text="Loading certified driver network..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDrivers} />
      ) : filteredDrivers.length === 0 ? (
        <EmptyState
          title="No drivers found"
          description="Try clearing search filters or changing the transmission type."
        />
      ) : (
        <Card className="overflow-hidden border-slate-200/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Driver</th>
                  <th className="px-4 py-3.5">Experience & Transmission</th>
                  <th className="px-4 py-3.5">Vehicle Capability</th>
                  <th className="px-4 py-3.5">Rates (LKR)</th>
                  <th className="px-4 py-3.5">Driving Score</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrivers.map((driver) => {
                  const user = driver.user || {};
                  return (
                    <tr key={driver._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} name={user.name} size="sm" />
                          <div>
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-slate-400 text-[11px] flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{driver.operatingAreas?.[0]?.city || user.address?.city || 'Colombo / Western'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">
                          {driver.drivingExperienceYears || 0} years experience
                        </div>
                        <div className="flex gap-1 mt-1">
                          {Array.isArray(driver.transmissionSkills) ? (
                            driver.transmissionSkills.map((t, idx) => (
                              <Badge key={idx} variant="info" size="xs" className="capitalize">
                                {t}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="info" size="xs" className="capitalize">
                              {driver.transmissionSkills === 'both' ? 'Manual & Auto' : driver.transmissionSkills || 'Manual & Auto'}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[170px]">
                          {(driver.vehicleCategoriesCanDrive || ['Car']).map((vc, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {vc}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <div>Rs. {driver.hourlyRate?.toLocaleString() || '1,200'}/hr</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          Full day: Rs. {driver.fullDayRate?.toLocaleString() || '9,000'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-slate-900 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{driver.drivingSkillScore ? driver.drivingSkillScore.toFixed(1) : '5.0'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {driver.totalTripsCompleted || 0} trips completed
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={driver.isAvailableNow ? 'success' : 'neutral'}
                          size="xs"
                        >
                          {driver.isAvailableNow ? '● Online' : '○ Offline'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/drivers/${driver._id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                        >
                          <span>Profile</span>
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

export default AdminDriversPage;
