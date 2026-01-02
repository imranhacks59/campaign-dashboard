import React from 'react';
import clsx from 'clsx';
import { Campaign } from '@/types/types';

interface Props {
  items: Campaign[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  className?: string;
  // allow parent to override maxHeight if needed
  maxHeight?: string;
}

const statusClass = (status?: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/95 text-white';
    case 'paused':
      return 'bg-amber-500/95 text-white';
    case 'completed':
      return 'bg-slate-600/90 text-white';
    default:
      return 'bg-slate-400/80 text-white';
  }
};

const CampaignList: React.FC<Props> = ({ items, onSelect, selectedId, className, maxHeight = 'calc(100vh - 260px)' }) => {
  return (
    <div className={clsx('rounded-lg bg-white/3 border border-slate-800 p-3 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="graphheaders text-slate-100">Campaigns</h3>
        <div className="text-xs text-slate-400">{items.length}</div>
      </div>

      <div
        className="space-y-1 overflow-auto pr-2"
        style={{ maxHeight, scrollbarGutter: 'stable' }}
      >
        {items.map((c) => {
          const isSelected = selectedId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelect?.(c.id)}
              title={c.name}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 rounded hover:bg-white/4 transition text-left',
                isSelected ? 'ring-2 ring-indigo-500 bg-white/5' : ''
              )}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate text-slate-100">{c.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">Status: <span className="text-slate-300 font-medium">{c.status ?? 'unknown'}</span></div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <span className={clsx('inline-flex items-center justify-center px-2 py-0.5 rounded text-xs', statusClass(c.status))}>
                  {c.status}
                </span>
                <span className="text-xs text-slate-400">›</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignList;