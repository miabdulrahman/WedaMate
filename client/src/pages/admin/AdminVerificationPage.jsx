import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Car,
  Clock,
  Eye,
  Award,
  AlertCircle
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { Loader, ErrorState, EmptyState } from '../../components/ui/FeedbackStates.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminVerificationPage = () => {
  const toast = useToast();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Review Form state
  const [reviewNotes, setReviewNotes] = useState('');
  const [badges, setBadges] = useState(['id_verified']);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const list = await adminService.getVerifications({
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setVerifications(list || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch verification queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter]);

  const handleOpenReview = (verif) => {
    setSelectedVerification(verif);
    setReviewNotes('');
    setBadges(['id_verified']);
  };

  const handleDecision = async (status) => {
    if (!selectedVerification) return;
    try {
      setActionLoading(true);
      await adminService.reviewVerification(selectedVerification._id, {
        status,
        reviewNotes: reviewNotes || (status === 'approved' ? 'Verified by WedaMate Trust & Safety' : 'Documents insufficient or illegible'),
        badges: status === 'approved' ? badges : []
      });
      toast.success(`Verification ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setSelectedVerification(null);
      fetchVerifications();
    } catch (err) {
      toast.error(err.message || 'Failed to submit decision');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleBadge = (badgeName) => {
    setBadges((prev) =>
      prev.includes(badgeName) ? prev.filter((b) => b !== badgeName) : [...prev, badgeName]
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Trust & Safety: KYC & License Review
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review Sri Lankan National Identity Cards (NIC), heavy/light vehicle driving licenses, and police reports
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'pending', label: 'Pending Review' },
          { id: 'approved', label: 'Approved' },
          { id: 'rejected', label: 'Rejected' },
          { id: 'all', label: 'All Records' }
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
        <Loader text="Loading document verification queue..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchVerifications} />
      ) : verifications.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter} verifications`}
          description="The queue is currently clear for this status."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {verifications.map((verif) => {
            const user = verif.user || {};
            return (
              <Card key={verif._id} className="p-5 border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} name={user.name} size="md" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">{user.name || 'Applicant'}</h2>
                        <span className="text-[11px] text-slate-400 capitalize">{user.role || 'Partner'}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        verif.status === 'approved'
                          ? 'success'
                          : verif.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                      className="capitalize"
                    >
                      {verif.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">NIC / ID No:</span>
                      <span className="font-semibold text-slate-800">{verif.nicNumber || 'Pending'}</span>
                    </div>
                    {verif.drivingLicenseNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">License No:</span>
                        <span className="font-semibold text-slate-800">{verif.drivingLicenseNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Submitted:</span>
                      <span>{new Date(verif.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Documents Attached:</span>
                      <span className="font-semibold text-slate-800">
                        {verif.documents?.length || 0} files
                      </span>
                    </div>
                  </div>

                  {verif.reviewNotes && (
                    <div className="text-[11px] bg-slate-100/80 p-2.5 rounded-lg text-slate-600 mb-4">
                      <strong className="text-slate-800">Admin Note:</strong> {verif.reviewNotes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    ID: {verif._id.slice(-6)}
                  </span>
                  <Button
                    size="sm"
                    variant={verif.status === 'pending' ? 'primary' : 'outline'}
                    onClick={() => handleOpenReview(verif)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    <span>{verif.status === 'pending' ? 'Review & Verify' : 'View Details'}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedVerification && (
        <Modal
          isOpen={!!selectedVerification}
          onClose={() => setSelectedVerification(null)}
          title="Identity & Credential Audit"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Avatar
                src={selectedVerification.user?.avatar}
                name={selectedVerification.user?.name}
                size="md"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedVerification.user?.name}</h3>
                <p className="text-xs text-slate-500">{selectedVerification.user?.email}</p>
                <Badge variant="info" size="xs" className="mt-1 capitalize">
                  {selectedVerification.user?.role} Applicant
                </Badge>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800">Applicant Submissions</h4>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[11px]">NIC Number</span>
                  <span className="font-semibold text-slate-900">{selectedVerification.nicNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">License Number</span>
                  <span className="font-semibold text-slate-900">{selectedVerification.drivingLicenseNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Document List */}
              <h4 className="font-bold text-slate-800 pt-2">Attached Documents</h4>
              {selectedVerification.documents && selectedVerification.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedVerification.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{doc.documentType || 'Document'}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{doc.fileUrl}</p>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl?.startsWith('http') ? doc.fileUrl : `/api${doc.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        View File
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-xs">No file uploads attached.</p>
              )}

              {/* Badges to Award */}
              <div className="pt-2">
                <label className="font-bold text-slate-800 block mb-2">Award Trust Badges</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'id_verified', label: 'NIC / ID Verified' },
                    { id: 'license_verified', label: 'Driving License Vetted' },
                    { id: 'police_cleared', label: 'Police Background Cleared' }
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBadge(b.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        badges.includes(b.id)
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {badges.includes(b.id) ? '✓ ' : '+ '}
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Note */}
              <div className="pt-2">
                <label className="font-bold text-slate-800 block mb-1">Moderator Audit Note</label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Driving license verified with Department of Motor Traffic. Clean record."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedVerification(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={actionLoading}
                onClick={() => handleDecision('rejected')}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                <span>Reject</span>
              </Button>
              <Button
                variant="success"
                size="sm"
                loading={actionLoading}
                onClick={() => handleDecision('approved')}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                <span>Approve & Grant Badges</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminVerificationPage;
