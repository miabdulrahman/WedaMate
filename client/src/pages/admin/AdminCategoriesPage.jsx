import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Layers,
  Wrench
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Loader, ErrorState, EmptyState } from '../../components/ui/FeedbackStates.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminCategoriesPage = () => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const list = await adminService.getCategories();
      setCategories(list || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setIcon('');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCat(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setIcon(cat.icon || '');
    setDescription(cat.description || '');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: icon || 'Wrench',
      description
    };

    try {
      setActionLoading(true);
      if (editingCat) {
        await adminService.updateCategory(editingCat._id, payload);
        toast.success('Category updated successfully');
      } else {
        await adminService.createCategory(payload);
        toast.success('New category added successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!window.confirm(`Are you sure you want to remove category "${catName}"?`)) return;
    try {
      await adminService.deleteCategory(id);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Service Catalog & Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize service taxonomy, icons, and market categories across Sri Lanka
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Category</span>
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <Loader text="Loading marketplace catalog..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCategories} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories configured"
          description="Create your first service category to populate the marketplace."
          actionText="Create Category"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Card key={cat._id} className="p-5 border-slate-200/80 flex flex-col justify-between hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <Badge variant={cat.isActive ? 'success' : 'neutral'} size="xs">
                    {cat.isActive ? 'Active' : 'Draft'}
                  </Badge>
                </div>
                <h2 className="text-base font-bold text-slate-900">{cat.name}</h2>
                <div className="text-xs font-mono text-slate-400 mt-0.5">/{cat.slug}</div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {cat.description || 'No description provided'}
                </p>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {cat.subcategories.slice(0, 3).map((sub, idx) => (
                      <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] px-2 py-0.5 rounded border border-slate-200">
                        {sub.name || sub}
                      </span>
                    ))}
                    {cat.subcategories.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{cat.subcategories.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id, cat.name)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCat ? 'Edit Service Category' : 'Create New Category'}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Category Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCat) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }
                }}
                placeholder="e.g. Electrical & Wiring"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. electrical-wiring"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Icon Identifier</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. Zap, Wrench, Paintbrush"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief explanation of services covered in this category..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={actionLoading}>
                {editingCat ? 'Update Category' : 'Save Category'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
