import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import type { ApexOptions } from 'apexcharts';

interface Props {
  series: number[];
  labels: string[];
  title?: string;
  chartId?: string;
  className?: string;
}

const DonutChart: React.FC<Props> = ({ series, labels, title = 'Status', chartId = `donut-${Math.random().toString(36).slice(2, 9)}`, className = '' }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted || !ref.current) return;

    const options: ApexOptions = {
      chart: { type: 'donut', height: 240, toolbar: { show: false }, id: chartId },
      labels,
      legend: { position: 'bottom', labels: { colors: ['#cbd5e1', '#cbd5e1', '#cbd5e1'] }, markers: { width: 8, height: 8 } },
      stroke: { width: 0 },
      dataLabels: { enabled: false },
      colors: ['#1098ff', '#00e396', '#ffc107'],
      tooltip: {
        y: {
          formatter: (v: number) => (typeof v === 'number' ? v.toLocaleString() : String(v))
        }
      },
      responsive: [
        { breakpoint: 640, options: { chart: { height: 200 }, legend: { position: 'bottom' } } }
      ]
    };

    const chart = new ApexCharts(ref.current, { ...options, series });
    chartRef.current = chart;
    chart.render().catch((e) => console.warn('[DonutChart] render error', e));

    return () => {
      try {
        chartRef.current?.destroy?.();
      } catch (e) {
        console.warn('[DonutChart] destroy failed', e);
      } finally {
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, chartId]);

  useEffect(() => {
    if (!chartRef.current) return;
    try {
      chartRef.current.updateSeries(series as any);
      chartRef.current.updateOptions({ labels });
    } catch (e) {
      console.warn('[DonutChart] update failed', e);
    }
  }, [series, labels]);

  return (
    <div className={`rounded-lg bg-white/3 border border-slate-800 p-4 shadow-sm ${className}`}>
      <div className="mb-2">
        <div className="text-sm font-semibold text-slate-100">{title}</div>
      </div>
      <div ref={ref} id={chartId} style={{ minHeight: 220 }} />
    </div>
  );
};

export default DonutChart;