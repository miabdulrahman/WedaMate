import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  MessageSquare,
  User,
  ArrowRight
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Loader, ErrorState, EmptyState } from '../../components/ui/FeedbackStates.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminReportsPage = () => {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [resolveModal, setResolveModal] = useState({ isOpen: false, report: null, status: 'resolved', notes: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const list = await adminService.getReports({
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setReports(list || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolve = async () => {
    if (!resolveModal.report) return;
    try {
      setActionLoading(true);
      await adminService.resolveReport(resolveModal.report._id, {
        status: resolveModal.status,
        resolutionNotes: resolveModal.notes || 'Resolved by administrator'
      });
      toast.success(`Report marked as ${resolveModal.status}`);
      setResolveModal({ isOpen: false, report: null, status: 'resolved', notes: '' });
      fetchReports();
    } catch (err) {
      toast.error(err.message || 'Failed to update report');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Disputes & Incident Reports
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review customer service disputes, vehicle safety complaints, and behavioral incident reports
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'pending', label: 'Pending Action' },
          { id: 'under_review', label: 'Under Review' },
          { id: 'resolved', label: 'Resolved' },
          { id: 'all', label: 'All Incidents' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-colors ${
              statusFilter === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <Loader text="Loading customer incident reports..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReports} />
      ) : reports.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter} disputes`}
          description="All clear! No open incident disputes reported for this category."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <Card key={rep._id} className="p-5 border-slate-200/80">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        rep.status === 'resolved'
                          ? 'success'
                          : rep.status === 'pending'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                      className="capitalize"
                    >
                      {rep.status}
                    </Badge>
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                      {rep.reason || 'General Dispute'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {rep.description}
                  </p>

                  <div className="flex items-center gap-6 text-xs text-slate-500 pt-1">
                    <div>
                      <span className="text-slate-400">Reported By: </span>
                      <strong className="text-slate-800">{rep.reporter?.name || 'Customer'}</strong>
                    </div>
                    {rep.targetUser && (
                      <div>
                        <span className="text-slate-400">Subject: </span>
                        <strong className="text-slate-800">{rep.targetUser?.name || 'Provider'}</strong>
                      </div>
                    )}
                    {rep.booking && (
                      <div>
                        <span className="text-slate-400">Booking: </span>
                        <strong className="text-slate-800 font-mono">#{rep.booking._id?.slice(-6)}</strong>
                      </div>
                    )}
                  </div>

                  {rep.resolutionNotes && (
                    <div className="text-[11px] bg-emerald-50 text-emerald-800 p-2.5 rounded-lg">
                      <strong>Resolution Note:</strong> {rep.resolutionNotes}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {rep.status !== 'resolved' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        setResolveModal({
                          isOpen: true,
                          report: rep,
                          status: 'resolved',
                          notes: ''
                        })
                      }
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      <span>Take Action</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {resolveModal.isOpen && (
        <Modal
          isOpen={resolveModal.isOpen}
          onClose={() => setResolveModal({ isOpen: false, report: null, status: 'resolved', notes: '' })}
          title="Resolve Dispute Incident"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Resolution Outcome</label>
              <select
                value={resolveModal.status}
                onChange={(e) => setResolveModal((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="resolved">Mark as Resolved (Refund / Warning Issued)</option>
                <option value="under_review">Keep Under Investigation</option>
                <option value="dismissed">Dismiss (No Violation Found)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Resolution Summary Note</label>
              <textarea
                rows={3}
                value={resolveModal.notes}
                onChange={(e) => setResolveModal((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Explain the settlement or outcome for future reference..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResolveModal({ isOpen: false, report: null, status: 'resolved', notes: '' })}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                loading={actionLoading}
                onClick={handleResolve}
              >
                Submit Resolution
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminReportsPage;
