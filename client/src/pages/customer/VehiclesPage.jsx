import React, { useState, useEffect } from 'react';
import { Car, Plus, Trash2, CheckCircle2, Shield } from 'lucide-react';
import vehicleService from '../../services/vehicleService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Skeleton, EmptyState } from '../../components/ui/FeedbackStates.jsx';

export const VehiclesPage = () => {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Vehicle Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2019');
  const [transmission, setTransmission] = useState('automatic');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const list = await vehicleService.getMyVehicles();
      setVehicles(list);
    } catch (err) {
      showToast(err.message || 'Failed to load vehicles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!nickname || !brand || !model || !transmission) {
      showToast('Please fill in required vehicle fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await vehicleService.addVehicle({
        nickname,
        vehicleType,
        brand,
        model,
        year: parseInt(year),
        transmission,
        registrationNumber,
        isDefault
      });
      showToast('Vehicle added to your garage!', 'success');
      setModalOpen(false);
      // Reset form
      setNickname('');
      setModel('');
      setRegistrationNumber('');
      fetchVehicles();
    } catch (err) {
      showToast(err.message || 'Failed to add vehicle', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await vehicleService.deleteVehicle(id);
      showToast('Vehicle removed', 'info');
      fetchVehicles();
    } catch (err) {
      showToast(err.message || 'Failed to remove', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Vehicles</h1>
            <Badge variant="driver" size="xs">Drive My Vehicle Garage</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Register your personal vehicles for seamless driver dispatch and accurate transmission matching.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={() => setModalOpen(true)}
          className="font-bold shrink-0"
        >
          Add Vehicle
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles in your garage"
          description="Add your car, SUV, or van to hire vetted drivers to drive your vehicle on demand."
          actionLabel="Add Your First Vehicle"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <Card key={v._id} className="p-5 relative border border-slate-200/90 rounded-2xl bg-white">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Car className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{v.nickname}</h4>
                      {v.isDefault && (
                        <Badge variant="success" size="xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {v.brand} {v.model} ({v.year})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteVehicle(v._id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Transmission</span>
                  <span className="font-bold text-slate-800 capitalize">{v.transmission}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Reg Number</span>
                  <span className="font-mono text-slate-700 font-semibold">{v.registrationNumber || 'Not specified'}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>Vehicle registration numbers are masked publicly for privacy.</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register a Vehicle in Your Garage">
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <Input
            label="Vehicle Nickname *"
            required
            placeholder="e.g. Daily Prius, Family Outstation Van"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Type *</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
              >
                <option value="car">Car / Sedan / Hatchback</option>
                <option value="suv">SUV / Crossover</option>
                <option value="van">Passenger Van (KDH, etc.)</option>
                <option value="pickup">Pickup / Double-Cab</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Transmission *</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Make / Brand *"
              required
              placeholder="e.g. Toyota, Honda, Nissan"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
            <Input
              label="Model *"
              required
              placeholder="e.g. Axio, Vezel, Prius"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Manufacturing Year"
              type="number"
              min="1980"
              max="2030"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <Input
              label="Registration Number"
              placeholder="e.g. WP CAB-8492"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Set as primary vehicle for Drive My Vehicle bookings</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={submitting} className="font-bold">
              Save Vehicle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VehiclesPage;
