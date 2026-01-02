import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface Props {
  series: number[];
  labels: string[];
  title?: string;
}

const DonutChart: React.FC<Props> = ({ series, labels, title = '' }) => {
  const options: ApexOptions = {
    chart: { type: 'donut', toolbar: { show: false } },
    labels,
    legend: { position: 'bottom' },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => String(v) } }
  };

  return (
    <div className="rounded-sm border bg-white p-4 shadow-default">
      <div className="mb-2">
        <p className="graphheaders">{title}</p>
      </div>
      <ReactApexChart options={options} series={series} type="donut" height={220} />
    </div>
  );
};

export default DonutChart;