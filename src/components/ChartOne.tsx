import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';
import { FiDownload, FiChevronDown } from 'react-icons/fi';

const defaultColors = [
  '#60a5fa',    // blue-400
  '#34d399',    // green-400
  '#fbbf24',    // amber-400
  '#4ade80',    // lime-400
  '#f87171',    // red-400
  '#a78bfa'     // violet-400
];

const baseOptions: ApexOptions = {
  colors: defaultColors,
  chart: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto',
    type: 'bar',
    height: 380, // ← increased for better spacing
    stacked: false,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 6,
      columnWidth: '55%',
    },
  },
  dataLabels: {
    enabled: false, // we enable conditionally via prop
    offsetY: -20,
    style: {
      fontSize: '13px',
      colors: ['#e5e7eb'],
    },
  },
  xaxis: {
    categories: [],
    labels: {
      rotate: -45,
      rotateAlways: true,
      trim: true,
      minHeight: 80,
      style: {
        colors: '#d1d5db', // gray-300
        fontSize: '13px',
        fontWeight: 500,
      },
    },
    tickPlacement: 'on',
  },
  yaxis: {
    labels: {
      style: {
        colors: '#d1d5db',
        fontSize: '14px', // ← bigger and more visible
        fontWeight: 500,
      },
      formatter: (value: number) => {
        if (value >= 1e7) return (value / 1e7).toFixed(1) + 'Cr';
        if (value >= 1e5) return (value / 1e5).toFixed(1) + 'L';
        if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
        return value.toFixed(0);
      },
    },
  },
  grid: {
    borderColor: '#374151', // gray-700
    strokeDashArray: 4,
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    labels: {
      colors: '#e5e7eb',
    },
    markers: { strokeWidth: 0 },
    fontSize: '14px',
  },
  tooltip: {
    enabled: true,
    shared: true,
    intersect: false,
    fillSeriesColor: false,
    theme: 'dark',
    style: {
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
    },
    y: {
      formatter: (val: number) => (val !== undefined ? val.toLocaleString() : '—'),
    },
  },
};

type Series = { name: string; data: number[] }[];

interface Props {
  title: string;
  subtitle?: string;
  series: Series;
  categories: string[];
  barColors?: string[];
  isFullWidth?: boolean;
  chartId?: string;
  isDataLabels?: boolean;
  className?: string;
}

const ChartOne: React.FC<Props> = ({
  title,
  subtitle,
  series = [],
  categories = [],
  barColors = [],
  isFullWidth = false,
  chartId = `chart-${Math.random().toString(36).slice(2, 9)}`,
  isDataLabels = true, // ← default to true now
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const options: ApexOptions = {
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        id: chartId,
      },
      colors: barColors.length ? barColors : baseOptions.colors,
      xaxis: {
        ...baseOptions.xaxis,
        categories,
      },
      dataLabels: {
        ...baseOptions.dataLabels,
        enabled: isDataLabels,
      },
    };

    const apx = new ApexCharts(containerRef.current, {
      ...options,
      series,
    });
    chartRef.current = apx;
    apx.render().catch((e) => console.warn('[ChartOne] render error', e));

    return () => {
      try {
        chartRef.current?.destroy?.();
      } catch (e) {
        console.warn('[ChartOne] destroy failed', e);
      }
      chartRef.current = null;
    };
  }, [isMounted, chartId, barColors]);

  useEffect(() => {
    if (!chartRef.current) return;

    try {
      chartRef.current.updateOptions({
        xaxis: { categories },
        colors: barColors.length ? barColors : baseOptions.colors,
        dataLabels: { enabled: isDataLabels },
      });
      chartRef.current.updateSeries(series, true);
    } catch (e) {
      console.warn('[ChartOne] update failed', e);
    }
  }, [series, categories, barColors, isDataLabels]);

  const handleExport = (type: 'png' | 'csv') => {
    try {
      if (type === 'png') {
        chartRef.current?.exportToPng?.();
      } else {
        const rows: string[] = [];
        const header = ['Category', ...series.map((s) => s.name)];
        rows.push(header.join(','));
        const len = categories.length;
        for (let i = 0; i < len; i++) {
          const row = [categories[i], ...series.map((s) => String(s.data[i] ?? ''))];
          rows.push(row.join(','));
        }
        const csv = rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.csv`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.warn('[ChartOne] export failed', e);
    }
    setIsDropdownOpen(false);
  };

  if (!series.length || !categories.length) {
    return <div className="rounded-lg bg-slate-800/50 p-6 text-slate-400">No data available</div>;
  }

  return (
    <div className={`rounded-xl bg-slate-900 border border-slate-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Export options"
          >
            <FiDownload className="w-4 h-4" />
            <FiChevronDown className="w-4 h-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 py-1 text-sm">
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-200"
                onClick={() => handleExport('csv')}
              >
                Export as CSV
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-200"
                onClick={() => handleExport('png')}
              >
                Export as PNG
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        <div
          ref={containerRef}
          id={chartId}
          style={{ minHeight: '340px' }}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ChartOne;