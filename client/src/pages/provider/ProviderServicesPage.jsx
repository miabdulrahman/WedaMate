import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  Plus,
  Check,
  Edit2,
  Trash2,
  Tag,
  Clock,
  DollarSign,
  Layers,
  Camera,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  X
} from 'lucide-react';
import providerService from '../../services/providerService.js';
import serviceService from '../../services/serviceService.js';
import uploadService from '../../services/uploadService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Loader, EmptyState } from '../../components/ui/FeedbackStates.jsx';

const PRESET_SERVICE_IMAGES = [
  { label: 'Plumbing', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80' },
  { label: 'Electrical', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80' },
  { label: 'AC Service', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80' },
  { label: 'Cleaning', url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80' },
  { label: 'Carpentry', url: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97e06?auto=format&fit=crop&w=600&q=80' },
  { label: 'Painting', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80' },
  { label: 'Gardening', url: 'https://images.unsplash.com/photo-1558904541-efa8c4a52d31?auto=format&fit=crop&w=600&q=80' },
  { label: 'Auto Care', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80' }
];

export const ProviderServicesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const serviceFileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Trade Info Modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profession, setProfession] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [startingPrice, setStartingPrice] = useState(2500);
  const [subcategoriesText, setSubcategoriesText] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Service Modal (Create & Edit)
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [servicePrice, setServicePrice] = useState(2500);
  const [serviceDuration, setServiceDuration] = useState(2);
  const [servicePricingType, setServicePricingType] = useState('fixed');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceImage, setServiceImage] = useState('');
  const [customServicePicUrl, setCustomServicePicUrl] = useState('');
  const [uploadingServicePic, setUploadingServicePic] = useState(false);
  const [savingService, setSavingService] = useState(false);

  const fetchProfileAndCategories = async () => {
    try {
      setLoading(true);
      const [myProfile, cats] = await Promise.all([
        providerService.getMyProfile().catch(() => null),
        serviceService.getCategories().catch(() => [])
      ]);

      setCategories(cats || []);

      if (myProfile) {
        setProfile(myProfile);
        setProfession(myProfile.profession || '');
        setBusinessName(myProfile.businessName || '');
        setStartingPrice(myProfile.startingPrice || 2500);
        setSubcategoriesText(myProfile.subcategories?.join(', ') || '');
      } else if (user?.id || user?._id) {
        const p = await providerService.getProviderById(user.id || user._id);
        setProfile(p);
        if (p) {
          setProfession(p.profession || '');
          setBusinessName(p.businessName || '');
          setStartingPrice(p.startingPrice || 2500);
          setSubcategoriesText(p.subcategories?.join(', ') || '');
        }
      }
    } catch (err) {
      console.error('Error loading provider profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndCategories();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
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
      showToast('Trade profile updated successfully', 'success');
      setProfileModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to update trade profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleServicePicFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    try {
      setUploadingServicePic(true);
      const res = await uploadService.uploadImage(file, 'wedamate/services');
      if (res?.url) {
        setServiceImage(res.url);
        showToast('Service picture uploaded!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload service picture', 'error');
    } finally {
      setUploadingServicePic(false);
      if (serviceFileInputRef.current) serviceFileInputRef.current.value = '';
    }
  };

  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceTitle('');
    setServiceCategory(categories[0]?._id || '');
    setServicePrice(profile?.startingPrice || 2500);
    setServiceDuration(2);
    setServicePricingType('fixed');
    setServiceDescription('');
    setServiceImage('');
    setCustomServicePicUrl('');
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (svc) => {
    setEditingServiceId(svc._id);
    setServiceTitle(svc.title);
    setServiceCategory(svc.category?._id || svc.category || '');
    setServicePrice(svc.price);
    setServiceDuration(svc.durationHours || 2);
    setServicePricingType(svc.pricingType || 'fixed');
    setServiceDescription(svc.description || '');
    setServiceImage(svc.image || '');
    setCustomServicePicUrl('');
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceTitle.trim()) {
      showToast('Please enter a service title', 'error');
      return;
    }

    try {
      setSavingService(true);
      const selectedCat = categories.find((c) => c._id === serviceCategory);

      const payload = {
        title: serviceTitle.trim(),
        category: serviceCategory || undefined,
        categoryName: selectedCat ? selectedCat.name : '',
        price: parseFloat(servicePrice) || 2500,
        durationHours: parseInt(serviceDuration) || 2,
        pricingType: servicePricingType,
        description: serviceDescription.trim(),
        image: serviceImage || ''
      };

      if (editingServiceId) {
        const res = await providerService.updateService(editingServiceId, payload);
        if (res?.services) {
          setProfile((prev) => ({ ...prev, services: res.services }));
        }
        showToast('Service updated successfully', 'success');
      } else {
        const res = await providerService.addService(payload);
        if (res?.services) {
          setProfile((prev) => ({ ...prev, services: res.services }));
        }
        showToast('New service added successfully!', 'success');
      }
      setServiceModalOpen(false);
      fetchProfileAndCategories();
    } catch (err) {
      showToast(err.message || 'Failed to save service', 'error');
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (serviceId, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return;

    try {
      const res = await providerService.deleteService(serviceId);
      if (res?.services) {
        setProfile((prev) => ({ ...prev, services: res.services }));
      } else {
        setProfile((prev) => ({
          ...prev,
          services: prev.services.filter((s) => s._id !== serviceId)
        }));
      }
      showToast('Service deleted successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete service', 'error');
    }
  };

  if (loading) {
    return <Loader message="Loading your services & rates..." size="lg" className="min-h-[50vh]" />;
  }

  const servicesList = profile?.services || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Services & Pricing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add and manage the exact services, rates, and packages customers can book on your profile
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Edit2} onClick={() => setProfileModalOpen(true)}>
            Edit Trade Info
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAddService}>
            Add New Service
          </Button>
        </div>
      </div>

      {/* Trade Info Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Profession</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-slate-900">{profile?.profession || 'Service Professional'}</div>
          <div className="text-xs text-slate-500 mt-1">{profile?.businessName || 'Independent Contractor'}</div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Base Starting Rate</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            LKR {profile?.startingPrice?.toLocaleString() || '2,500'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Starting price for general inquiries</div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Offerings</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{servicesList.length} Services</div>
          <div className="text-xs text-slate-400 mt-1">Available for direct customer booking</div>
        </Card>
      </div>

      {/* Services List Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Custom Services & Offerings</h2>
          <Button variant="secondary" size="xs" icon={Plus} onClick={handleOpenAddService}>
            Add Service
          </Button>
        </div>

        {servicesList.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No individual services added yet"
            description="Add your first specific service with a custom price so customers can book it directly."
            actionText="+ Add First Service"
            onAction={handleOpenAddService}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicesList.map((svc) => (
              <Card key={svc._id} className="p-5 border-slate-200 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div>
                  {svc.image ? (
                    <div className="h-36 w-full rounded-2xl overflow-hidden mb-3 bg-slate-100 border border-slate-100 relative group">
                      <img src={svc.image} alt={svc.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-slate-900/70 text-white text-[10px] font-bold backdrop-blur-xs">
                        {svc.pricingType || 'fixed'}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{svc.title}</h3>
                    {!svc.image && (
                      <Badge variant={svc.pricingType === 'hourly' ? 'info' : 'success'} size="xs">
                        {svc.pricingType || 'fixed'}
                      </Badge>
                    )}
                  </div>

                  {svc.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{svc.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{svc.durationHours || 2} hrs duration</span>
                    </span>
                    {svc.categoryName && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>{svc.categoryName}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Service Fee</span>
                    <strong className="text-sm font-black text-emerald-700">
                      LKR {svc.price?.toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Edit2}
                      onClick={() => handleOpenEditService(svc)}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => handleDeleteService(svc._id, svc.title)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        title={editingServiceId ? 'Edit Service Offering' : 'Add New Service Offering'}
      >
        <form onSubmit={handleSaveService} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Service Title *</label>
            <Input
              required
              placeholder="e.g. Emergency Pipe Leak Repair"
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
            />
          </div>

          {/* Service Picture Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Service Picture / Photo</label>
              {serviceImage && (
                <button
                  type="button"
                  onClick={() => setServiceImage('')}
                  className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {serviceImage ? (
              <div className="relative rounded-2xl overflow-hidden h-36 w-full mb-3 border border-slate-200 bg-slate-100 group">
                <img src={serviceImage} alt="Service Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="bg-white text-slate-900"
                    onClick={() => serviceFileInputRef.current?.click()}
                  >
                    Change Photo
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="xs"
                    onClick={() => setServiceImage('')}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Upload}
                    isLoading={uploadingServicePic}
                    onClick={() => serviceFileInputRef.current?.click()}
                  >
                    Upload Picture from Device
                  </Button>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Or paste image URL (https://...)"
                      value={customServicePicUrl}
                      onChange={(e) => setCustomServicePicUrl(e.target.value)}
                      icon={LinkIcon}
                      className="text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!customServicePicUrl.trim()}
                    onClick={() => {
                      setServiceImage(customServicePicUrl.trim());
                      setCustomServicePicUrl('');
                    }}
                  >
                    Apply
                  </Button>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Or choose a trade photo:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_SERVICE_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setServiceImage(preset.url)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[11px] font-bold text-slate-700 shrink-0 border border-slate-200 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={serviceFileInputRef}
              onChange={handleServicePicFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Service Category</label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pricing Model</label>
              <select
                value={servicePricingType}
                onChange={(e) => setServicePricingType(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
                <option value="quote_based">Quote Based</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Rate in LKR *</label>
              <Input
                type="number"
                min="500"
                step="50"
                required
                placeholder="2500"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Hours</label>
              <Input
                type="number"
                min="1"
                max="24"
                value={serviceDuration}
                onChange={(e) => setServiceDuration(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Service Description</label>
            <textarea
              rows="3"
              placeholder="What does this service include? (e.g. Tools and labor included, materials extra)..."
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setServiceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={savingService}>
              {editingServiceId ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Trade Info Modal */}
      <Modal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} title="Edit Trade Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4">
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
            label="Base Starting Rate (LKR) *"
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
              placeholder="e.g. Leak Detection, Pressure Pumps, Bathroom Fitting"
              value={subcategoriesText}
              onChange={(e) => setSubcategoriesText(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={savingProfile}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderServicesPage;
