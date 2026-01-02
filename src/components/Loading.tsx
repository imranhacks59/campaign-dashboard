import React from 'react';

/**
 * Page-level loading skeleton that mirrors the dashboard layout.
 * Used while campaigns or aggregate insights are loading.
 */
const Loading: React.FC<{ message?: string }> = ({ message = 'Loading dashboard...' }) => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header */}
      <div className="h-10 w-1/3 bg-slate-800 rounded" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-20 rounded-lg bg-slate-800" />
        <div className="h-20 rounded-lg bg-slate-800" />
        <div className="h-20 rounded-lg bg-slate-800" />
        <div className="h-20 rounded-lg bg-slate-800" />
      </div>

      {/* Main grid: left list, center chart, right sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-3 space-y-4">
          <div className="h-64 rounded-lg bg-slate-800" />
        </div>

        <div className="xl:col-span-6 space-y-4">
          <div className="h-64 rounded-lg bg-slate-800" />
          <div className="h-28 rounded-lg bg-slate-800" />
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="h-40 rounded-lg bg-slate-800" />
          <div className="h-28 rounded-lg bg-slate-800" />
        </div>
      </div>

      <div className="text-sm text-slate-400">{message}</div>
    </div>
  );
};

export default Loading;