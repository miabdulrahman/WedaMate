import React, { useState, useEffect } from 'react';
import {
  Settings,
  Percent,
  DollarSign,
  Car,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { Loader, ErrorState } from '../../components/ui/FeedbackStates.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminSettingsPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    commissionPercentage: 10,
    baseServiceFee: 250,
    driverHourlyMinRate: 800,
    maintenanceMode: false,
    enablePayHereSandbox: true,
    enableSmsNotifications: true
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSettings();
      if (data) {
        setForm({
          commissionPercentage: data.commissionPercentage ?? 10,
          baseServiceFee: data.baseServiceFee ?? 250,
          driverHourlyMinRate: data.driverHourlyMinRate ?? 800,
          maintenanceMode: Boolean(data.maintenanceMode),
          enablePayHereSandbox: data.enablePayHereSandbox ?? true,
          enableSmsNotifications: data.enableSmsNotifications ?? true
        });
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.updateSettings(form);
      toast.success('Platform settings successfully updated and applied');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading marketplace parameters..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSettings} />;

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Platform Economic & System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure financial commission cuts, minimum driver wages, payment gateway credentials, and dispatch rules
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Marketplace Economics */}
        <Card className="p-6 border-slate-200/80">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Marketplace Take Rate & Minimums</h2>
              <p className="text-xs text-slate-500">Revenue calculations applied at checkout</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Platform Commission (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={form.commissionPercentage}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, commissionPercentage: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Default is 10% deducted from booking</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Base Booking Fee (LKR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={form.baseServiceFee}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, baseServiceFee: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">LKR</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Minimum dispatch fee</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Driver Min Hourly Rate (LKR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  step="50"
                  value={form.driverHourlyMinRate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, driverHourlyMinRate: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">LKR/hr</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Guaranteed wage floor for drivers</p>
            </div>
          </div>
        </Card>

        {/* Payment & Sri Lankan Gateways */}
        <Card className="p-6 border-slate-200/80">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">PayHere Gateway & Currency</h2>
              <p className="text-xs text-slate-500">Sri Lankan local payment processing in LKR</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-800">PayHere Sandbox Environment</p>
                <p className="text-[11px] text-slate-500">Test mock transactions without debiting actual bank accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enablePayHereSandbox}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, enablePayHereSandbox: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-800">SMS / WhatsApp Trip Notifications</p>
                <p className="text-[11px] text-slate-500">Send instant driver arrival alerts to customer phones via Dialog / Mobitel</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableSmsNotifications}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, enableSmsNotifications: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Maintenance Toggle */}
        <Card className="p-6 border-slate-200/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Platform Maintenance Mode</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Temporarily pause new customer booking dispatches while performing database updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, maintenanceMode: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" size="md" loading={saving}>
            <Save className="w-4 h-4 mr-2" />
            <span>Save Platform Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
