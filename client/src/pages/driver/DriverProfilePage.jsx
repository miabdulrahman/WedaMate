import React, { useState, useEffect } from 'react';
import { Car, Key, ShieldCheck, DollarSign, Clock, Check, Edit2 } from 'lucide-react';
import driverService from '../../services/driverService.js';
import apiClient from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Badge from '../../components/ui/Badge.jsx';

export const DriverProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [transmissionSkills, setTransmissionSkills] = useState('both');
  const [drivingExperienceYears, setDrivingExperienceYears] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(1200);
  const [halfDayRate, setHalfDayRate] = useState(5000);
  const [fullDayRate, setFullDayRate] = useState(9000);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  // License verification submission
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [submittingVerification, setSubmittingVerification] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const d = await driverService.getDriverById(user.id);
          setProfile(d);
          if (d) {
            setTransmissionSkills(d.transmissionSkills || 'both');
            setDrivingExperienceYears(d.drivingExperienceYears || 5);
            setHourlyRate(d.hourlyRate || 1200);
            setHalfDayRate(d.halfDayRate || 5000);
            setFullDayRate(d.fullDayRate || 9000);
            setBio(d.bio || '');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveRates = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await driverService.updateProfile({
        transmissionSkills,
        drivingExperienceYears: parseInt(drivingExperienceYears),
        hourlyRate: parseFloat(hourlyRate),
        halfDayRate: parseFloat(halfDayRate),
        fullDayRate: parseFloat(fullDayRate),
        bio
      });
      setProfile(updated);
      showToast('Driver profile & rate rules updated', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitLicenseVerification = async (e) => {
    e.preventDefault();
    if (!nationalIdNumber || !drivingLicenseNumber) {
      showToast('Please provide your NIC and Driving License numbers', 'error');
      return;
    }

    try {
      setSubmittingVerification(true);
      await apiClient('/verification/submit', {
        method: 'POST',
        body: {
          profileType: 'driver',
          nationalIdNumber,
          drivingLicenseNumber,
          drivingExperienceYears: parseInt(drivingExperienceYears)
        }
      });
      showToast('Verification submitted! Our admin team will review your credentials.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit verification', 'error');
    } finally {
      setSubmittingVerification(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Driver Profile & Credentials</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage transmission capabilities, rate models, and license verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rate & Transmission Configuration */}
        <Card className="p-6 bg-white border border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Transmission & Pricing Rules</h3>
          <form onSubmit={handleSaveRates} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Transmission Capability *</label>
              <select
                value={transmissionSkills}
                onChange={(e) => setTransmissionSkills(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
              >
                <option value="both">Both (Manual & Automatic)</option>
                <option value="automatic">Automatic Only</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>

            <Input
              label="Driving Experience (Years) *"
              type="number"
              min="1"
              max="50"
              value={drivingExperienceYears}
              onChange={(e) => setDrivingExperienceYears(e.target.value)}
            />

            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Hourly (LKR)"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
              <Input
                label="Half-Day (LKR)"
                type="number"
                value={halfDayRate}
                onChange={(e) => setHalfDayRate(e.target.value)}
              />
              <Input
                label="Full-Day (LKR)"
                type="number"
                value={fullDayRate}
                onChange={(e) => setFullDayRate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Driver Bio & Experience</label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell clients about your driving record, comfort with highway routes, and vehicle care..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <Button type="submit" variant="secondary" size="sm" isLoading={saving} className="w-full font-bold">
              Save Rate Rules
            </Button>
          </form>
        </Card>

        {/* License Verification Submission */}
        <Card className="p-6 bg-white border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">License & Identity Verification</h3>
            <Badge
              variant={profile?.licenseVerificationStatus === 'verified' ? 'verified' : 'warning'}
              size="xs"
            >
              {profile?.licenseVerificationStatus?.toUpperCase() || 'PENDING'}
            </Badge>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            WedaMate verifies every driver's Sri Lankan driver's license number before awarding the <strong>Verified Driver</strong> trust badge.
          </p>

          <form onSubmit={handleSubmitLicenseVerification} className="space-y-4">
            <Input
              label="National Identity Card (NIC) Number *"
              required
              placeholder="e.g. 199012345678 or 901234567V"
              value={nationalIdNumber}
              onChange={(e) => setNationalIdNumber(e.target.value)}
            />

            <Input
              label="Valid Driving License Number *"
              required
              placeholder="e.g. B-749210-WP"
              value={drivingLicenseNumber}
              onChange={(e) => setDrivingLicenseNumber(e.target.value)}
            />

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-100">
              🔒 License metadata is encrypted and verified confidentially by WedaMate administrators.
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submittingVerification}
              className="w-full font-bold"
            >
              Submit Credentials for Review
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default DriverProfilePage;
