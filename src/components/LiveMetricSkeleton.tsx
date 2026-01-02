import React from 'react';

const LiveMetricSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="h-4 w-1/3 bg-slate-800 rounded" />
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <div className="h-4 w-3/4 bg-slate-800 rounded" />
        <div className="h-4 w-1/2 bg-slate-800 rounded" />
        <div className="h-4 w-2/3 bg-slate-800 rounded" />
        <div className="h-4 w-1/3 bg-slate-800 rounded" />
      </div>
    </div>
  );
};

export default LiveMetricSkeleton;