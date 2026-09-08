import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowDownLeft, CheckCircle2, Clock } from 'lucide-react';
import apiClient from '../../services/apiClient.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Skeleton, EmptyState } from '../../components/ui/FeedbackStates.jsx';

export const ProviderEarningsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const res = await apiClient('/payments/history');
        setPayments(res.data?.payments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const totalEarnings = payments.reduce((acc, p) => acc + (p.providerEarnings || 0), 0);
  const totalCommission = payments.reduce((acc, p) => acc + (p.platformCommission || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Earnings & Payouts</h1>
        <p className="text-xs text-slate-500 mt-0.5">Track your net earnings from completed customer jobs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 bg-white border border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Net Provider Earnings</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            LKR {totalEarnings.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">From {payments.length} completed transactions</span>
        </Card>

        <Card className="p-6 bg-white border border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Platform Commission (10%)</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">
            LKR {totalCommission.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Includes customer insurance & platform safety</span>
        </Card>
      </div>

      <Card className="p-6 bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Transaction History</h3>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No payment records found yet. Earnings will appear here once jobs are completed.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((p) => (
              <div key={p._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-800 block">Transaction #{p.transactionId}</strong>
                  <span className="text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-700 text-sm block">
                    +LKR {p.providerEarnings?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Gross: LKR {p.amount?.toLocaleString()} (Fee: LKR {p.platformCommission?.toLocaleString()})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProviderEarningsPage;
