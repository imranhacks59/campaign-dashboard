import React from 'react';
import { FiSearch, FiRefreshCw, FiFilter, FiTrendingUp } from 'react-icons/fi';
import { useCampaigns } from '../hooks/useCampaigns';
import { useAggregateInsights } from '../hooks/useInsights';
import Layout from '../components/Layout';
import ChartOne from '../components/ChartOne';
import DonutChart from '../components/DonutChart';
import CampaignList from '../components/CampaignList';
import Loading from '../components/Loading';
import { useCampaignSSE } from '../hooks/useCampaignSSE';

const formatNumber = (n?: number) => (typeof n === 'number' ? n.toLocaleString() : '-');
const formatCurrency = (n?: number) => (typeof n === 'number' ? `$${n.toLocaleString()}` : '-');

const StatCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode; accent?: string }> = ({
  label,
  value,
  icon,
  accent = 'bg-primary'
}) => {
  return (
    <div className="rounded-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
          <div className="mt-1 text-lg font-semibold">{value}</div>
        </div>
        <div className={`w-10 h-10 rounded-md flex items-center justify-center text-white ${accent}`}>
          {icon ?? <FiTrendingUp className="w-5 h-5" />}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { data: campaignsData, isLoading: campaignsLoading, refetch: refetchCampaigns } = useCampaigns();
  const { data: aggData, isLoading: aggLoading, refetch: refetchAgg } = useAggregateInsights();

  const [query, setQuery] = React.useState('');
  const campaigns = campaignsData?.campaigns || [];
  const [selectedCampaign, setSelectedCampaign] = React.useState<string | null>(null);
  const [liveMetric, setLiveMetric] = React.useState<any>(null);

  useCampaignSSE(selectedCampaign, (payload) => {
    setLiveMetric(payload);
  });

  const handleRefresh = async () => {
    await Promise.all([refetchCampaigns(), refetchAgg()]);
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return `${c.name} ${c.brand_id} ${c.platforms?.join(' ')}`.toLowerCase().includes(q);
  });

  if (campaignsLoading || aggLoading) return <Loading />;

  // prepare chart series
  const topCampaigns = filteredCampaigns.slice(0, 6);
  const series = [{ name: 'Daily Spend', data: topCampaigns.map((c) => c.daily_budget ?? 0) }];
  const categories = topCampaigns.map((c) => c.name);

  const donutSeries = [
    aggData?.insights?.active_campaigns ?? 0,
    aggData?.insights?.paused_campaigns ?? 0,
    aggData?.insights?.completed_campaigns ?? 0
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header area inside page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Campaigns Monitor</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time performance at a glance. Select a campaign to stream live metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center">
              <FiSearch className="absolute left-3 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="pl-10 pr-3 py-2 rounded-md border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm w-64 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              <FiRefreshCw className="w-4 h-4" /> Refresh
            </button>

            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition">
              <FiFilter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total campaigns" value={formatNumber(aggData?.insights?.total_campaigns)} icon={<FiTrendingUp />} />
          <StatCard label="Active" value={formatNumber(aggData?.insights?.active_campaigns)} icon="🟢" accent="bg-emerald-500" />
          <StatCard label="Total Spend" value={formatCurrency(aggData?.insights?.total_spend)} icon="💲" accent="bg-yellow-500" />
          <StatCard label="Avg CTR" value={`${formatNumber(aggData?.insights?.avg_ctr)}%`} icon="📈" accent="bg-indigo-500" />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Left column: campaigns + donut */}
          <div className="xl:col-span-3 space-y-4">
            <CampaignList items={filteredCampaigns} onSelect={(id) => setSelectedCampaign(id)} />
            <DonutChart series={donutSeries} labels={['Active', 'Paused', 'Completed']} title="Campaign Status" />
          </div>

          {/* Center: charts */}
          <div className="xl:col-span-6 space-y-4">
            <ChartOne title="Top campaigns (daily budget)" series={series} categories={categories} chartId="top-campaigns" />

            <div className="rounded-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 shadow-sm">
              <h3 className="text-sm font-medium">Aggregate Insights</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Impressions</div>
                  <div className="font-semibold">{formatNumber(aggData?.insights?.total_impressions)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Clicks</div>
                  <div className="font-semibold">{formatNumber(aggData?.insights?.total_clicks)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Conversions</div>
                  <div className="font-semibold">{formatNumber(aggData?.insights?.total_conversions)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Avg CPC</div>
                  <div className="font-semibold">${formatNumber(aggData?.insights?.avg_cpc)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: live metrics */}
          <div className="xl:col-span-3">
            <div className="rounded-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 shadow-sm">
              <h3 className="text-sm font-medium">Live Metrics</h3>
              {selectedCampaign ? (
                <div className="mt-3 text-sm space-y-2">
                  <div className="text-xs text-slate-500">Campaign</div>
                  <div className="font-semibold">{selectedCampaign}</div>
                  <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                    <div className="text-xs text-slate-500">Impressions</div>
                    <div className="font-semibold">{formatNumber(liveMetric?.impressions)}</div>

                    <div className="text-xs text-slate-500 mt-2">Clicks</div>
                    <div className="font-semibold">{formatNumber(liveMetric?.clicks)}</div>

                    <div className="text-xs text-slate-500 mt-2">Conversions</div>
                    <div className="font-semibold">{formatNumber(liveMetric?.conversions)}</div>

                    <div className="text-xs text-slate-500 mt-2">Spend</div>
                    <div className="font-semibold">{formatCurrency(liveMetric?.spend)}</div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-slate-500">Select a campaign from the list to stream real-time metrics.</div>
              )}
            </div>

            {/* recent activity / placeholder */}
            <div className="mt-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 shadow-sm">
              <h3 className="text-sm font-medium">Recent Activity</h3>
              <ul className="mt-3 text-sm space-y-2 text-slate-600 dark:text-slate-300">
                <li>Campaign "Summer Sale - Meta" updated budgets</li>
                <li>Campaign "Holiday Special - YouTube" reached 50% of daily budget</li>
                <li>Auto-optimization ran for 3 campaigns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;