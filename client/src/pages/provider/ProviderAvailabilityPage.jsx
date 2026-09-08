import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';
import providerService from '../../services/providerService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

export const ProviderAvailabilityPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isAvailableToday, setIsAvailableToday] = useState(true);
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);

  const daysList = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
    { id: 0, name: 'Sunday' }
  ];

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await providerService.updateProfile({
        availability: {
          daysOfWeek: selectedDays,
          startTime,
          endTime,
          isAvailableToday
        }
      });
      showToast('Availability schedule saved', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update schedule', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Availability & Schedule</h1>
        <p className="text-xs text-slate-500 mt-0.5">Control when clients can book your on-demand trade services</p>
      </div>

      <Card className="p-6 bg-white border border-slate-200">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Realtime Available Toggle */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Accepting Bookings Today</h4>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Displays the green "Available Today" badge on your public provider card
              </p>
            </div>
            <input
              type="checkbox"
              checked={isAvailableToday}
              onChange={(e) => setIsAvailableToday(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Working Days */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Operating Days</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {daysList.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDay(d.id)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    selectedDays.includes(d.id)
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Daily Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="Daily End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="secondary" size="sm" isLoading={saving} className="font-bold">
              Save Schedule
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProviderAvailabilityPage;
