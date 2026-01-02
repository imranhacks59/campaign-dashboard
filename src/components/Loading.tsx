import React from 'react';

const Loading: React.FC<{ message?: string }> = ({ message = 'Loading dashboard...' }) => {
  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      <div className="h-10 w-1/3 bg-slate-800 rounded mb-6" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

    </div>
  );
};

export default Loading;