import React, { useState } from 'react';
import { User, Phone, MapPin, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import authService from '../../services/authService.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Badge from '../../components/ui/Badge.jsx';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.address?.city || 'Colombo');
  const [district, setDistrict] = useState(user?.address?.district || 'Colombo');
  const [savingDetails, setSavingDetails] = useState(false);

  // Password update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      setSavingDetails(true);
      const updated = await authService.updateProfile({
        name,
        phone,
        address: { city, district }
      });
      updateUser(updated);
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
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your personal information, address, and security settings</p>
      </div>

      {/* Profile Overview Card */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg">{user?.name}</h3>
              <Badge variant="default" size="xs">
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="hidden sm:block text-right text-xs text-slate-400">
          Status: <strong className="text-emerald-700 capitalize font-bold">{user?.status || 'Active'}</strong>
        </div>
      </Card>

      {/* Edit Details */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4">Personal & Address Details</h3>
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
              placeholder="+94 77 ..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="City"
              icon={MapPin}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <Input
            label="District"
            icon={MapPin}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="secondary" size="sm" isLoading={savingDetails}>
              Save Details
            </Button>
          </div>
        </form>
      </Card>

      {/* Security: Change Password */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4">Update Password</h3>
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
            <Button type="submit" variant="primary" size="sm" isLoading={updatingPass}>
              Change Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
