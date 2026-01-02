import React from 'react';
import { FiSearch, FiRefreshCw, FiFilter, FiTrendingUp } from 'react-icons/fi';
import { useCampaigns } from '../hooks/useCampaigns';
import { useAggregateInsights } from '../hooks/useInsights';
import { useCampaignInsights } from '../hooks/useCampaignInsights';
import Layout from '../components/Layout';
import ChartOne from '../components/ChartOne';
import DonutChart from '../components/DonutChart';
import CampaignList from '../components/CampaignList';
import Loading from '../components/Loading';
import LiveMetricSkeleton from '../components/LiveMetricSkeleton';
import { useCampaignSSE } from '../hooks/useCampaignSSE';
import AggregateInsightsCard from '../components/AggregateInsightsCard';

const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString() : '-');
const fmtMoney = (n?: number) => (typeof n === 'number' ? `$${n.toLocaleString()}` : '-');

const StatCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode; accent?: string }> = ({
  label,
  value,
  icon,
  accent = 'bg-indigo-600'
}) => {
  return (
    <div className="rounded-lg bg-white/3 border border-slate-800 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400">{label}</div>
          <div className="mt-1 text-lg font-semibold text-slate-100">{value}</div>
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
  const [sseError, setSseError] = React.useState<{ status?: number; message?: string; timestamp?: string } | null>(null);

  // Snapshot fetch for selected campaign
  const {
    data: campaignInsightSnapshot,
    isLoading: campaignInsightLoading,
    isError: campaignInsightIsError,
    error: campaignInsightError,
    refetch: refetchCampaignInsight
  } = useCampaignInsights(selectedCampaign);

  // SSE subscription: provide onMessage and onError handlers
  useCampaignSSE(
    selectedCampaign,
    (payload) => {
      // reset any previous SSE error and update live metric
      setSseError(null);
      setLiveMetric(payload);
    },
    (err) => {
      // SSE error to UI
      setSseError({ status: err.status, message: err.message, timestamp: err.timestamp });
    }
  );

  // select first campaign by default
  React.useEffect(() => {
    if (!selectedCampaign && campaigns.length > 0) {
      setSelectedCampaign(campaigns[0].id);
      setLiveMetric(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns]);

  const handleSelectCampaign = (id: string) => {
    if (id === selectedCampaign) return;
    setSelectedCampaign(id);
    setLiveMetric(null);
    setSseError(null);
  };

  const handleRefresh = async () => {
    await Promise.all([refetchCampaigns(), refetchAgg()]);
    // also refetch campaign snapshot if one selected
    if (selectedCampaign) await refetchCampaignInsight();
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return `${c.name} ${c.brand_id} ${c.platforms?.join(' ')}`.toLowerCase().includes(q);
  });

  // Page-level skeleton inside Layout (keeps header visible)
  if (campaignsLoading || aggLoading) {
    return (
      <Layout>
        <Loading message="Loading campaigns & insights..." />
      </Layout>
    );
  }

  // prepare chart series and donut
  const topCampaigns = filteredCampaigns.slice(0, 6);
  const series = [{ name: 'Daily Spend', data: topCampaigns.map((c) => c.daily_budget ?? 0) }];
  const categories = topCampaigns.map((c) => c.name);

  const donutSeries = [
    aggData?.insights?.active_campaigns ?? 0,
    aggData?.insights?.paused_campaigns ?? 0,
    aggData?.insights?.completed_campaigns ?? 0
  ];

  // choose metric to show: SSE overrides snapshot
  const snapshot = campaignInsightSnapshot?.insights ?? null;
  const metricToShow = liveMetric ?? snapshot;

  const selectedCampaignObj = campaigns.find((c) => c.id === selectedCampaign);
  const selectedCampaignName = selectedCampaignObj?.name ?? selectedCampaign ?? '';

  // retry SSE: toggle subscription (quick reset)
  const retrySSE = () => {
    if (!selectedCampaign) return;
    const id = selectedCampaign;
    setSseError(null);
    setLiveMetric(null);
    setSelectedCampaign(null);
    // re-subscribe after a short delay
    setTimeout(() => setSelectedCampaign(id), 150);
  };

  // retry snapshot fetch
  const retrySnapshot = async () => {
    if (!selectedCampaign) return;
    setLiveMetric(null);
    setSseError(null);
    await refetchCampaignInsight();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Campaigns Monitor</h2>
            <p className="text-sm text-slate-400 mt-1">Real-time performance at a glance. Select a campaign to stream live metrics.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center">
              <FiSearch className="absolute left-3 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search campaigns..." className="pl-10 pr-3 py-2 rounded-md border border-slate-800 bg-slate-800 text-sm w-64 focus:outline-none" />
            </div>

            <button onClick={handleRefresh} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 border border-slate-800 shadow-sm hover:bg-slate-700 transition">
              <FiRefreshCw className="w-4 h-4" /> Refresh
            </button>

            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 border border-slate-800 shadow-sm hover:bg-slate-700 transition">
              <FiFilter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total campaigns" value={fmt(aggData?.insights?.total_campaigns)} />
          <StatCard label="Active" value={fmt(aggData?.insights?.active_campaigns)} icon="🟢" accent="bg-emerald-500" />
          <StatCard label="Total Spend" value={fmtMoney(aggData?.insights?.total_spend)} icon="💲" accent="bg-yellow-500" />
          <StatCard label="Avg CTR" value={`${fmt(aggData?.insights?.avg_ctr)}%`} icon="📈" accent="bg-indigo-500" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          <div className="xl:col-span-3 space-y-4 self-start">
            <div style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)' }}>
              <CampaignList items={filteredCampaigns} onSelect={handleSelectCampaign} selectedId={selectedCampaign} maxHeight="calc(100vh - 220px)" />
            </div>

          

          
          </div>

          <div className="xl:col-span-6 space-y-4 self-start">
            <div className="rounded-lg bg-white/3 border border-slate-800 overflow-hidden">
              <div className="flex items-start justify-between px-4 py-3 border-b border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-100">Top campaigns (daily budget)</div>
                  <div className="text-xs text-slate-400 mt-1">Top performing campaigns by daily budget</div>
                </div>
              </div>

              <div className="p-4">
                <ChartOne series={series} categories={categories} chartId="top-campaigns" renderChartOnly />
                <div className="mt-4">
                  <AggregateInsightsCard insights={aggData?.insights ?? null} />
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4 self-start">
            <div className="rounded-lg bg-white/3 border border-slate-800 p-4 shadow-sm">
              <h3 className="text-sm font-medium text-slate-100">Live Metrics</h3>

              {selectedCampaign ? (
                <>
                  {/* show snapshot or sse data when available; show skeleton while waiting */}
                  {(!metricToShow || campaignInsightLoading) ? (
                    <div className="mt-3">
                      <LiveMetricSkeleton />
                    </div>
                  ) : (
                    <div className="mt-3 text-sm space-y-2">
                      {/* {sseError && (
                        <div className="mb-3 rounded-md bg-red-900/40 border border-red-700 p-2 text-sm text-red-200">
                          <div className="font-medium">Live updates unavailable</div>
                          <div className="text-xs">{sseError.status ? `Status ${sseError.status}: ` : ''}{sseError.message}</div>
                          <div className="mt-2 flex gap-2">
                            <button onClick={retrySSE} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Retry live</button>
                            <button onClick={retrySnapshot} className="px-2 py-1 bg-slate-800 text-white rounded text-xs">Refetch snapshot</button>
                          </div>
                        </div>
                      )}

                      {campaignInsightIsError && (
                        <div className="mb-3 rounded-md bg-yellow-900/30 border border-yellow-700 p-2 text-sm text-yellow-200">
                          <div className="font-medium">Snapshot failed</div>
                          <div className="text-xs">{(campaignInsightError as any)?.message ?? 'Failed to load campaign metrics'}</div>
                          <div className="mt-2">
                            <button onClick={retrySnapshot} className="px-2 py-1 bg-yellow-700 text-white rounded text-xs">Retry</button>
                          </div>
                        </div>
                      )} */}

                      <div className="text-xs text-slate-400">Campaign</div>
                      <div className="font-semibold text-slate-100">{selectedCampaignName}</div>

                      <div className="pt-2 border-t border-slate-800">
                        <div className="text-xs text-slate-400">Impressions</div>
                        <div className="font-semibold text-slate-100">{fmt(metricToShow.impressions)}</div>

                        <div className="text-xs text-slate-400 mt-2">Clicks</div>
                        <div className="font-semibold text-slate-100">{fmt(metricToShow.clicks)}</div>

                        <div className="text-xs text-slate-400 mt-2">Conversions</div>
                        <div className="font-semibold text-slate-100">{fmt(metricToShow.conversions)}</div>

                        <div className="text-xs text-slate-400 mt-2">Spend</div>
                        <div className="font-semibold text-slate-100">{fmtMoney(metricToShow.spend)}</div>

                        <div className="text-xs text-slate-400 mt-2">CTR</div>
                        <div className="font-semibold text-slate-100">{metricToShow.ctr != null ? `${Number(metricToShow.ctr).toFixed(2)}%` : '—'}</div>

                        <div className="text-xs text-slate-400 mt-2">CPC</div>
                        <div className="font-semibold text-slate-100">{metricToShow.cpc != null ? `$${Number(metricToShow.cpc).toFixed(2)}` : '—'}</div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-3 text-sm text-slate-400">Select a campaign from the list to stream real-time metrics.</div>
              )}
            </div>

            <div className="mt-4">
              <DonutChart series={donutSeries} labels={['Active', 'Paused', 'Completed']} title="Campaign Status" />
            </div>

            <div className="rounded-lg bg-white/3 border border-slate-800 p-4 shadow-sm">
              <h3 className="text-sm font-medium text-slate-100">Recent Activity</h3>
              <ul className="mt-3 text-sm space-y-2 text-slate-300">
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