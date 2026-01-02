import React from 'react';
import { useCampaigns } from '../hooks/useCampaigns';
import { useAggregateInsights } from '../hooks/useInsights';
import Layout from '../components/Layout';
import ChartOne from '../components/ChartOne';
import DonutChart from '../components/DonutChart';
import CampaignList from '../components/CampaignList';
import Loading from '../components/Loading';
import { useCampaignSSE } from '../hooks/useCampaignSSE';

const Dashboard: React.FC = () => {
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns();
  const { data: aggData, isLoading: aggLoading } = useAggregateInsights();
  const campaigns = campaignsData?.campaigns || [];

  const [selectedCampaign, setSelectedCampaign] = React.useState<string | null>(null);
  const [liveMetric, setLiveMetric] = React.useState<any>(null);

  useCampaignSSE(selectedCampaign, (payload) => {
    setLiveMetric(payload);
  });

  if (campaignsLoading || aggLoading) return <Loading />;

  // Example: prepare series data for ChartOne
  const topCampaigns = campaigns.slice(0, 6);
  const series = [
    {
      name: 'Daily Spend',
      data: topCampaigns.map((c) => c.daily_budget ?? 0)
    }
  ];
  const categories = topCampaigns.map((c) => c.name);

  const donutSeries = [
    (aggData?.insights?.active_campaigns ?? 0),
    (aggData?.insights?.paused_campaigns ?? 0),
    (aggData?.insights?.completed_campaigns ?? 0)
  ];

  return (
    <Layout>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-3">
          <CampaignList items={campaigns} onSelect={(id) => setSelectedCampaign(id)} />
          <div className="mt-4">
            <DonutChart series={donutSeries} labels={['Active', 'Paused', 'Completed']} title="Campaign Status" />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <ChartOne title="Top campaigns (daily budget)" series={series} categories={categories} chartId="top-campaigns" />
          <div className="mt-4 rounded-sm border bg-white p-3 shadow-default">
            <h3 className="graphheaders">Aggregate Insights</h3>
            <div className="mt-2 text-sm">
              <div>Total campaigns: {aggData?.insights?.total_campaigns ?? '-'}</div>
              <div>Total spend: ${aggData?.insights?.total_spend?.toLocaleString() ?? '-'}</div>
              <div>Avg CTR: {aggData?.insights?.avg_ctr ?? '-'}%</div>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3">
          <div className="rounded-sm border bg-white p-3 shadow-default">
            <h3 className="graphheaders">Live Metrics</h3>
            {selectedCampaign ? (
              <div className="mt-2 text-sm">
                <div>Campaign: {selectedCampaign}</div>
                <div>Impressions: {liveMetric?.impressions ?? '—'}</div>
                <div>Clicks: {liveMetric?.clicks ?? '—'}</div>
                <div>Conversions: {liveMetric?.conversions ?? '—'}</div>
                <div>Spend: {liveMetric?.spend ?? '—'}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Select a campaign to view live metrics (SSE)</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;