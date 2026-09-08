import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Check, Edit2 } from 'lucide-react';
import providerService from '../../services/providerService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';

export const ProviderServicesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Services & Rates Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [profession, setProfession] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [startingPrice, setStartingPrice] = useState(2500);
  const [subcategoriesText, setSubcategoriesText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const p = await providerService.getProviderById(user.id);
          setProfile(p);
          if (p) {
            setProfession(p.profession || '');
            setBusinessName(p.businessName || '');
            setStartingPrice(p.startingPrice || 2500);
            setSubcategoriesText(p.subcategories?.join(', ') || '');
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

  const handleSaveServices = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const subs = subcategoriesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await providerService.updateProfile({
        profession,
        businessName,
        startingPrice: parseFloat(startingPrice),
        subcategories: subs
      });

      setProfile(updated);
      showToast('Services & pricing updated successfully', 'success');
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Services & Pricing</h1>
          <p className="text-xs text-slate-500 mt-0.5">Define your trade specialties, starting rates, and customer packages</p>
        </div>

        <Button variant="secondary" size="sm" icon={Edit2} onClick={() => setModalOpen(true)}>
          Edit Offerings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Primary Trade Information</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Profession</span>
              <strong className="text-slate-800 text-sm">{profile?.profession || 'Service Professional'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Business Name</span>
              <strong className="text-slate-800 text-sm">{profile?.businessName || 'Your Business Name'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Base Starting Price</span>
              <strong className="text-emerald-700 text-base">LKR {profile?.startingPrice?.toLocaleString() || '2,500'}</strong>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Specialized Categories</h3>
          <div className="flex flex-wrap gap-2">
            {profile?.subcategories?.map((sub, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                ✓ {sub}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Services & Starting Price">
        <form onSubmit={handleSaveServices} className="space-y-4">
          <Input
            label="Profession Title *"
            required
            placeholder="e.g. Master Plumber & Pipe Technician"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
          />

          <Input
            label="Business Name"
            placeholder="e.g. Negombo Premier Plumbing"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />

          <Input
            label="Starting Price (LKR) *"
            type="number"
            required
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
          />

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Subcategories / Skills (Comma-separated)
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Leak Detection, Pressure Pumps, Bathroom Fitting, Solar Heating"
              value={subcategoriesText}
              onChange={(e) => setSubcategoriesText(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={saving} className="font-bold">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderServicesPage;
