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


const DonutChart: React.FC<Props> = ({
  series,
  labels,
  title = 'Campaign Status',
  chartId = `donut-${Math.random().toString(36).slice(2, 9)}`,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // index of hovered slice; default to 0 so first slice shown by default
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(0);

  // palette (matches other charts)
  const colors = ['#1098ff', '#00e396', '#ffc107', '#28a745', '#8e44ad'];

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted || !ref.current) return;

    // ApexOptions typing expects 'states' at the top-level of options (not under chart).
    const options: ApexOptions = {
      chart: {
        type: 'donut',
        height: 220,
        toolbar: { show: false },
        id: chartId,
        animations: { enabled: false }, // disable animations so hover doesn't animate slices
        // events used only to update the hovered index (no animations)
        events: {
          dataPointMouseEnter: (_event: any, _chartContext: any, config: any) => {
            const idx = config?.dataPointIndex;
            if (typeof idx === 'number') setHoveredIdx(idx);
          },
          dataPointMouseLeave: () => {
            setHoveredIdx(null);
          }
        }
      },
      // states must be specified at the top-level of the options object (not under chart)
      states: {
        hover: {
          filter: {
            type: 'none'
          }
        }
      },
      labels,
      legend: { show: false }, // custom legend on the right
      stroke: { width: 0 },
      dataLabels: { enabled: false },
      colors,
      tooltip: {
        y: {
          formatter: (v: number) => (typeof v === 'number' ? v.toLocaleString() : String(v))
        }
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '65%',
            labels: {
              show: false // no center overlay
            }
          }
        }
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: { height: 180 },
            plotOptions: { pie: { donut: { size: '60%' } } }
          }
        }
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

  // update series/labels when props change
  useEffect(() => {
    if (!chartRef.current) return;
    try {
      chartRef.current.updateSeries(series as any);
      chartRef.current.updateOptions({ labels });
    } catch (e) {
      console.warn('[DonutChart] update failed', e);
    }
  }, [series, labels]);

  const total = series.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
  const activeIdx = hoveredIdx ?? 0;

  return (
    <div className={`rounded-lg bg-white/3 border border-slate-800 p-4 shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          <div className="text-xs text-slate-400 mt-1">Breakdown by status</div>
        </div>

        <div className="text-xs text-slate-400 ml-4 hidden sm:block text-right">
          <div className="text-xs">Total</div>
          <div className="mt-1 text-lg font-semibold text-slate-100">{total.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Chart area */}
        <div className="flex-1 min-w-0">
          <div ref={ref} id={chartId} style={{ minHeight: 180 }} />
        </div>

        {/* Right-side summary/legend — hovering legend items also sets hovered value */}
        <div className="w-full sm:w-44">
          <div className="mb-3 sm:hidden">
            <div className="text-xs text-slate-400">Total</div>
            <div className="mt-1 text-lg font-semibold text-slate-100">{total.toLocaleString()}</div>
          </div>

          <ul className="space-y-3">
            {labels.map((label, idx) => {
              const value = series[idx] ?? 0;
              const color = colors[idx % colors.length];
              const percent = total > 0 ? ((value / total) * 100) : 0;
              const isActive = idx === activeIdx;

              return (
                <li
                  key={label}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex items-center justify-between px-2 py-1 rounded ${isActive ? 'bg-white/5' : ''} cursor-default`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-none w-3 h-3 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                    <span className="text-sm text-slate-100 truncate">{label}</span>
                  </div>

                  <div className="text-sm font-medium text-slate-100 text-right">
                    <div>{(value as number).toLocaleString()}</div>
                    <div className="text-xs text-slate-400">{percent.toFixed(1)}%</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;