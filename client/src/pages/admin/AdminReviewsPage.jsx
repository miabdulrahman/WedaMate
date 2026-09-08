import React, { useState, useEffect } from 'react';
import {
  Star,
  Eye,
  EyeOff,
  Search,
  MessageSquare,
  ShieldCheck,
  User,
  CheckCircle
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Rating from '../../components/ui/Rating.jsx';
import { Loader, ErrorState, EmptyState } from '../../components/ui/FeedbackStates.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminReviewsPage = () => {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hiddenFilter, setHiddenFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReviews({
        isHidden: hiddenFilter || undefined,
        page,
        limit: 15
      });
      setReviews(res.reviews || []);
      setPagination(res.pagination || { total: 0, pages: 1 });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [hiddenFilter, page]);

  const handleToggleHide = async (review) => {
    try {
      setActionLoadingId(review._id);
      const nextHidden = !review.isHidden;
      await adminService.moderateReview(review._id, nextHidden);
      toast.success(`Review is now ${nextHidden ? 'hidden' : 'visible'}`);
      setReviews((prev) =>
        prev.map((r) => (r._id === review._id ? { ...r, isHidden: nextHidden } : r))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update review visibility');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Review & Feedback Moderation
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor customer reviews, driving skill ratings, and suppress inappropriate or spam content
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-slate-200/80">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500">Filter Visibility:</label>
          <select
            value={hiddenFilter}
            onChange={(e) => {
              setHiddenFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">All Reviews</option>
            <option value="false">Publicly Visible</option>
            <option value="true">Hidden by Moderator</option>
          </select>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Loader text="Loading marketplace reviews..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReviews} />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews found"
          description="There are currently no reviews matching your filter."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <Card
              key={rev._id}
              className={`p-5 border transition-all ${
                rev.isHidden ? 'bg-slate-50/70 border-rose-200' : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar src={rev.customer?.avatar} name={rev.customer?.name} size="sm" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        {rev.customer?.name || 'Customer'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Reviewed provider:{' '}
                        <strong className="text-slate-700">{rev.provider?.name || 'Partner'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Rating value={rev.rating} readOnly size="sm" />
                    <span className="font-bold text-xs text-slate-800">{rev.rating} / 5</span>
                    {rev.subRatings?.drivingSkill && (
                      <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded ml-2">
                        Driving Skill: {rev.subRatings.drivingSkill}★
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span>Date: {new Date(rev.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Booking #{rev.booking?._id?.slice(-6) || 'N/A'}</span>
                    {rev.isHidden && (
                      <Badge variant="danger" size="xs">
                        Hidden from Public
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-end gap-2">
                  <Button
                    size="xs"
                    variant={rev.isHidden ? 'success' : 'outline'}
                    loading={actionLoadingId === rev._id}
                    onClick={() => handleToggleHide(rev)}
                  >
                    {rev.isHidden ? (
                      <>
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>Make Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 mr-1 text-rose-600" />
                        <span className="text-rose-600">Hide Review</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-500">
              <span>
                Total: <strong className="text-slate-800">{pagination.total}</strong> reviews
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="font-semibold text-slate-800">
                  {page} / {pagination.pages}
                </span>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
