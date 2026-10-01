import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Phone,
  MapPin,
  Lock,
  Camera,
  Upload,
  Link as LinkIcon,
  Check,
  Briefcase,
  DollarSign,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import authService from '../../services/authService.js';
import providerService from '../../services/providerService.js';
import uploadService from '../../services/uploadService.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Badge from '../../components/ui/Badge.jsx';

const PRESET_AVATARS = [
  { name: 'Male Pro 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
  { name: 'Female Pro 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300' },
  { name: 'Male Pro 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' },
  { name: 'Female Pro 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300' },
  { name: 'Male Tech', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300' },
  { name: 'Female Tech', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' }
];

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // Avatar state
  const [avatar, setAvatar] = useState(
    user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  );
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // User details state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.address?.city || 'Colombo');
  const [district, setDistrict] = useState(user?.address?.district || 'Colombo');
  const [savingDetails, setSavingDetails] = useState(false);

  // Provider specific details state
  const isProvider = user?.role === 'provider';
  const [businessName, setBusinessName] = useState('');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [startingPrice, setStartingPrice] = useState(2500);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);

  // Load provider details if applicable
  useEffect(() => {
    if (isProvider) {
      providerService
        .getMyProfile()
        .then((profile) => {
          if (profile) {
            setBusinessName(profile.businessName || '');
            setProfession(profile.profession || '');
            setBio(profile.bio || '');
            setStartingPrice(profile.startingPrice || 2500);
          }
        })
        .catch((err) => console.warn('Could not load provider profile:', err));
    }
  }, [isProvider]);

  // Handle local file upload for Avatar
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be under 5MB', 'error');
      return;
    }

    try {
      setUploadingAvatar(true);
      const res = await uploadService.uploadAvatar(file);
      if (res?.url) {
        setAvatar(res.url);
        // Save immediately to user profile
        const updated = await authService.updateProfile({ avatar: res.url });
        updateUser(updated);
        showToast('Profile picture uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload profile picture', 'error');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Apply custom URL avatar
  const handleApplyCustomUrl = async () => {
    if (!customAvatarUrl.trim()) return;
    try {
      setUploadingAvatar(true);
      setAvatar(customAvatarUrl.trim());
      const updated = await authService.updateProfile({ avatar: customAvatarUrl.trim() });
      updateUser(updated);
      setCustomAvatarUrl('');
      showToast('Profile picture updated!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update picture', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Pick preset avatar
  const handlePickPreset = async (presetUrl) => {
    try {
      setUploadingAvatar(true);
      setAvatar(presetUrl);
      const updated = await authService.updateProfile({ avatar: presetUrl });
      updateUser(updated);
      showToast('Preset avatar selected!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update preset avatar', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save profile and provider details
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      setSavingDetails(true);

      const payload = {
        name,
        phone,
        address: { city, district },
        avatar
      };

      if (isProvider) {
        payload.providerDetails = {
          businessName,
          profession,
          bio,
          startingPrice: parseFloat(startingPrice) || 2500
        };
      }

      const updated = await authService.updateProfile(payload);
      updateUser(updated);

      // Also sync directly with provider profile endpoint
      if (isProvider) {
        await providerService.updateProfile({
          businessName,
          profession,
          bio,
          startingPrice: parseFloat(startingPrice) || 2500,
          serviceAreas: [{ city, district }]
        }).catch(() => {});
      }

      showToast('Profile details updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    try {
      setUpdatingPass(true);
      await authService.updatePassword({ currentPassword, newPassword });
      showToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Account & Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isProvider
            ? 'Manage your professional trade identity, profile picture, service rates, and security'
            : 'Manage your personal information, profile photo, address, and login security'}
        </p>
      </div>

      {/* 1. Profile Picture Management Card */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-700" />
            <h2 className="font-bold text-slate-900 text-lg">Profile Picture</h2>
          </div>
          <Badge variant="default" size="xs">
            {user?.role?.toUpperCase()}
          </Badge>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Main Avatar Preview */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-emerald-100 shadow-md relative bg-slate-100">
              <img
                src={avatar}
                alt={name || 'User Avatar'}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-1.5 font-bold">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  <span>Updating...</span>
                </div>
              )}
            </div>

            {/* Quick Trigger Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 p-2.5 bg-emerald-800 text-white rounded-2xl shadow-lg hover:bg-emerald-900 transition-all cursor-pointer border-2 border-white"
              title="Upload new picture"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Upload Controls & Presets */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Upload a photo from your device</h3>
              <p className="text-xs text-slate-500 mb-3">
                Clear headshot or business logo helps customers build trust (JPG, PNG, WEBP, max 5MB).
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={Upload}
                  isLoading={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Image File
                </Button>
              </div>
            </div>

            {/* Or Paste URL */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Or paste an Image URL</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    icon={LinkIcon}
                    className="text-xs"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!customAvatarUrl.trim() || uploadingAvatar}
                  onClick={handleApplyCustomUrl}
                >
                  Apply URL
                </Button>
              </div>
            </div>

            {/* Quick Preset Selector */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-2">Or choose a professional preset:</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePickPreset(preset.url)}
                    className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      avatar === preset.url ? 'border-emerald-600 scale-105 shadow-sm ring-2 ring-emerald-300' : 'border-slate-200 hover:border-slate-400'
                    }`}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Provider Business Profile Card (If Provider) */}
      {isProvider && (
        <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-700" />
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Provider Business & Services Profile</h2>
                <p className="text-xs text-slate-500">This information appears publicly on your provider profile page</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business / Trade Name"
                icon={Briefcase}
                placeholder="e.g. Negombo Premier Plumbing & AC"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />

              <Input
                label="Primary Profession / Skill Title"
                icon={User}
                placeholder="e.g. Master Plumber & Pipe Technician"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                About Your Services & Experience (Bio)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Highlight your years of experience, expertise, certifications, and service guarantee..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="w-full sm:w-1/2">
              <Input
                label="Starting Hourly / Base Rate (LKR)"
                type="number"
                min="500"
                step="100"
                icon={DollarSign}
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* 3. Personal & Contact Information */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm">
        <h2 className="font-bold text-slate-900 text-lg mb-1">Contact & Address Details</h2>
        <p className="text-xs text-slate-500 mb-6">Where customers and platform notifications reach you</p>

        <form onSubmit={handleUpdateDetails} className="space-y-4">
          <Input
            label="Full Name"
            icon={User}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              icon={Phone}
              placeholder="+94 77 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="City / Town"
              icon={MapPin}
              placeholder="e.g. Negombo"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <Input
            label="District / Province"
            icon={MapPin}
            placeholder="e.g. Gampaha"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={savingDetails}>
              Save All Profile Details
            </Button>
          </div>
        </form>
      </Card>

      {/* 4. Security: Change Password */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-5 h-5 text-slate-700" />
          <h2 className="font-bold text-slate-900 text-lg">Change Password</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">Ensure your WedaMate account is protected with a secure password</p>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            icon={Lock}
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              icon={Lock}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              icon={Lock}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="secondary" size="sm" isLoading={updatingPass}>
              Change Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
