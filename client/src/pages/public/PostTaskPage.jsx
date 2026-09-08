import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, DollarSign, MapPin, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import taskService from '../../services/taskService.js';
import serviceService from '../../services/serviceService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';

export const PostTaskPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(user?.address?.city || 'Negombo');
  const [district, setDistrict] = useState(user?.address?.district || 'Gampaha');
  const [budget, setBudget] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCats = async () => {
      try {
        const cats = await serviceService.getCategories();
        setCategories(cats);
        if (cats.length > 0) setCategory(cats[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    loadCats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/post-task');
      return;
    }

    if (!title || !description || !budget || !city) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const task = await taskService.createTask({
        title,
        category: category || undefined,
        description,
        location: {
          city,
          district,
          address: `${city}, ${district}`
        },
        budget: parseFloat(budget),
        preferredDate: preferredDate || undefined
      });

      showToast('Task posted! Local providers will start bidding.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to post task', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <PlusCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Post a Custom Task
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Can't find a fixed package? Describe what you need done and get custom offers from trusted providers.
        </p>
      </div>

      <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Task Title *</label>
            <Input
              required
              placeholder="e.g. Repair burst kitchen pipe and install water filter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Description *</label>
            <textarea
              required
              rows="4"
              placeholder="Provide exact details, dimensions, parts needed, or special access instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">City / Town *</label>
              <Input
                required
                icon={MapPin}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Target Budget (LKR) *</label>
              <Input
                type="number"
                required
                min="500"
                placeholder="e.g. 5000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Execution Date</label>
            <Input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Providers will submit competitive offers.</span>
            <Button type="submit" variant="secondary" size="md" isLoading={loading} className="font-bold">
              Post Task & Receive Bids
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PostTaskPage;
