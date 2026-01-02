import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';
import { RxHamburgerMenu } from 'react-icons/rx';

const defaultColors = [
  '#1098ff',
  'rgb(0, 227, 150)',
  '#ffc107',
  '#28a745',
  '#ff5733',
  '#8e44ad'
];

const baseOptions: ApexOptions = {
  colors: defaultColors,
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    type: 'bar',
    height: 335,
    stacked: false,
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  plotOptions: {
    bar: { horizontal: false, borderRadius: 0, columnWidth: '40%' }
  },
  dataLabels: { enabled: false },
  xaxis: { categories: [] },
  yaxis: {
    labels: {
      formatter: (value) => {
        if (value >= 1e7) return (value / 1e7).toFixed(1) + 'Cr';
        if (value >= 1e5) return (value / 1e5).toFixed(1) + 'L';
        if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
        return Number(value).toFixed(0);
      }
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Satoshi',
    fontWeight: 500,
    fontSize: '14px',
    markers: { strokeWidth: 2, fillColors: defaultColors, shape: 'circle' }
  },
  fill: { opacity: 1 },
  tooltip: { y: { formatter: (v: number) => String(v) } }
};

type Series = { name: string; data: number[] }[];

interface Props {
  title: string;
  series: Series;
  categories: string[];
  barColors?: string[];
  isFullWidth?: boolean;
  chartId?: string;
  isDashboard?: boolean;
  isDataLabels?: boolean;
}

const ChartOne: React.FC<Props> = ({
  title,
  series = [],
  categories = [],
  barColors = [],
  isFullWidth = false,
  chartId = `chart-${Math.random().toString(36).slice(2, 9)}`,
  isDashboard = false,
  isDataLabels = false
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // mount ApexCharts imperatively
  useEffect(() => {
    if (!isMounted) return;
    const el = containerRef.current;
    if (!el) return;

    const options: ApexOptions = {
      ...baseOptions,
      chart: { ...(baseOptions.chart as any), id: chartId },
      colors: barColors.length ? barColors : baseOptions.colors,
      xaxis: { ...(baseOptions.xaxis as any), categories },
      dataLabels: { enabled: isDataLabels },
      tooltip: { ...(baseOptions.tooltip as any), x: { show: true } }
    };

    // Compose series for apexcharts
    // ApexCharts expects array of { name, data }
    const apx = new ApexCharts(el, { ...options, series: series as any });
    chartRef.current = apx;

    apx.render().catch((e) => {
      // swallow render errors and log for debugging
      // Sometimes render fails if element not attached; this avoids uncaught promise
      // eslint-disable-next-line no-console
      console.warn('[ChartOne] apex render error', e);
    });

    return () => {
      try {
        // safe destroy wrapped in try/catch to avoid parentNode null errors
        if (chartRef.current && chartRef.current.destroy) {
          chartRef.current.destroy();
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[ChartOne] destroy failed', e);
      } finally {
        chartRef.current = null;
      }
    };
    // We intentionally don't include series/categories in deps to avoid re-creating chart
    // for every small update — you can add update logic below if needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, chartId, barColors]);

  // lightweight update method when props change (improves performance)
  useEffect(() => {
    if (!chartRef.current) return;
    try {
      chartRef.current.updateOptions({
        xaxis: { categories },
        colors: barColors.length ? barColors : baseOptions.colors
      });
      chartRef.current.updateSeries(series as any, true);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[ChartOne] update failed', e);
    }
  }, [series, categories, barColors]);

  const handleExport = (type: 'png' | 'csv') => {
    try {
      if (type === 'png') {
        chartRef.current?.exportToPng?.();
      } else {
        chartRef.current?.dataURI?.(); // apex has multiple ways; for CSV you may implement export from data source
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('export failed', e);
    }
    setIsDropdownOpen(false);
  };

  if (!series || !categories) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`rounded-sm border bg-white px-2 pt-1 shadow-default ${isFullWidth ? 'w-full' : 'w-auto'}`}>
      <div className="mb-2 flex justify-between items-center">
        <p className="graphheaders">{title}</p>
        <div className="relative">
          <button className="graphheaders" onClick={() => setIsDropdownOpen((s) => !s)}>
            <RxHamburgerMenu className="w-5 h-5" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg">
              <ul>
                <li>
                  <button className="block w-full p-2 text-left" onClick={() => handleExport('csv')}>
                    Export CSV
                  </button>
                </li>
                <li>
                  <button className="block w-full p-2 text-left" onClick={() => handleExport('png')}>
                    Export PNG
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Container div for ApexCharts */}
      <div ref={containerRef} id={chartId} style={{ minHeight: 260 }} />
    </div>
  );
};

export default ChartOne;