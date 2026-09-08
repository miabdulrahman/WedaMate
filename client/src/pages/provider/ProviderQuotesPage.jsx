import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Clock, Send, CheckCircle2 } from 'lucide-react';
import quoteService from '../../services/quoteService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import { Skeleton, EmptyState } from '../../components/ui/FeedbackStates.jsx';

export const ProviderQuotesPage = () => {
  const { showToast } = useToast();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Respond Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [activeQuote, setActiveQuote] = useState(null);
  const [proposedPrice, setProposedPrice] = useState('');
  const [estimatedDurationHours, setEstimatedDurationHours] = useState(3);
  const [materialsIncluded, setMaterialsIncluded] = useState(false);
  const [materialsDetails, setMaterialsDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const list = await quoteService.getQuotes();
      setQuotes(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const openRespondModal = (q) => {
    setActiveQuote(q);
    setProposedPrice(q.offer?.proposedPrice || '');
    setEstimatedDurationHours(q.offer?.estimatedDurationHours || 3);
    setMaterialsIncluded(q.offer?.materialsIncluded || false);
    setMaterialsDetails(q.offer?.materialsDetails || '');
    setNotes(q.offer?.notes || '');
    setModalOpen(true);
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!proposedPrice || !activeQuote) return;

    try {
      setSubmitting(true);
      await quoteService.respondQuote(activeQuote._id, {
        proposedPrice: parseFloat(proposedPrice),
        estimatedDurationHours: parseInt(estimatedDurationHours),
        materialsIncluded,
        materialsDetails,
        notes
      });
      showToast('Quote offer sent to client!', 'success');
      setModalOpen(false);
      fetchQuotes();
    } catch (err) {
      showToast(err.message || 'Failed to submit quote offer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Custom Quotation Requests</h1>
        <p className="text-xs text-slate-500 mt-0.5">Review customer task specifications and send competitive bids</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No quote requests"
          description="You do not have any pending quote requests from clients at the moment."
        />
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => (
            <Card key={q._id} className="p-6 bg-white border border-slate-200">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 text-base">{q.customer?.name}</h4>
                    <span className="text-xs text-slate-400">({q.location?.city}, {q.location?.district})</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-xl">
                    "{q.taskDescription}"
                  </p>
                </div>

                <Badge
                  variant={
                    q.status === 'accepted'
                      ? 'success'
                      : q.status === 'rejected'
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                >
                  {q.status?.toUpperCase()}
                </Badge>
              </div>

              {q.offer?.proposedPrice && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 my-3 border border-slate-100">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Your Submitted Offer:</span>
                    <span className="text-emerald-700 font-extrabold">
                      LKR {q.offer.proposedPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Est. Duration: {q.offer.estimatedDurationHours} hours • Materials:{' '}
                    {q.offer.materialsIncluded ? 'Included' : 'Not Included'}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                {q.status === 'pending' && (
                  <Button variant="secondary" size="xs" onClick={() => openRespondModal(q)}>
                    {q.offer?.proposedPrice ? 'Update Offer' : 'Submit Quotation'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quote Offer Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Draft Quote Offer">
        <form onSubmit={handleSendOffer} className="space-y-4">
          <Input
            label="Proposed Price (LKR) *"
            type="number"
            required
            min="500"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Estimated Duration (Hours)"
              type="number"
              min="1"
              value={estimatedDurationHours}
              onChange={(e) => setEstimatedDurationHours(e.target.value)}
            />

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={materialsIncluded}
                  onChange={(e) => setMaterialsIncluded(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Materials Included</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Offer Notes / Scope</label>
            <textarea
              rows="3"
              placeholder="Detail what is included in this price..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm" isLoading={submitting} className="font-bold">
              Send Offer to Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderQuotesPage;
