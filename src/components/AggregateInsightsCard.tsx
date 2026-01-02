import React from 'react';
import { AggregateInsights } from '@/types/types';
import { FiArrowUpRight, FiBarChart2, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

const num = (n?: number) => (typeof n === 'number' ? n.toLocaleString() : '-');
const currency = (n?: number) => (typeof n === 'number' ? `$${n.toLocaleString()}` : '-');

interface Props {
  insights?: AggregateInsights | null;
  className?: string;
}

const MiniStat: React.FC<{ label: string; value: React.ReactNode; accent?: string; icon?: React.ReactNode }> = ({ label, value, accent = 'bg-indigo-600', icon }) => {
  return (
    <div className="rounded-md bg-white/3 border border-slate-800 p-3 flex items-center justify-between">
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="mt-1 text-lg font-semibold text-slate-100">{value}</div>
      </div>
      <div className={`ml-3 w-9 h-9 flex items-center justify-center rounded-md ${accent} text-white`}>
        {icon}
      </div>
    </div>
  );
};

const AggregateInsightsCard: React.FC<Props> = ({ insights, className = '' }) => {
  return (
    <div className={`rounded-lg border border-slate-800 bg-white/3 p-4 py-8 pb-12 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-100">Aggregate Insights</h3>
        <div className="text-xs text-slate-400">
          {insights?.timestamp ? new Date(insights.timestamp).toLocaleString() : ''}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat
          label="Total campaigns"
          value={num(insights?.total_campaigns)}
          accent="bg-indigo-600"
          icon={<FiBarChart2 className="w-4 h-4" />}
        />

        <MiniStat
          label="Active"
          value={num(insights?.active_campaigns)}
          accent="bg-emerald-500"
          icon={<FiTrendingUp className="w-4 h-4" />}
        />

        <MiniStat
          label="Total Spend"
          value={currency(insights?.total_spend)}
          accent="bg-yellow-500"
          icon={<FiDollarSign className="w-4 h-4" />}
        />

        <MiniStat
          label="Avg CTR"
          value={insights?.avg_ctr != null ? `${insights.avg_ctr}%` : '-'}
          accent="bg-violet-600"
          icon={<FiArrowUpRight className="w-4 h-4" />}
        />
      </div>
    </div>
  );
};

export default AggregateInsightsCard;