import { AggregateInsights, Campaign, CampaignInsight } from '@/types/types';
import axiosInstance from '../lib/axiosInstance';

const handleAxiosError = (err: any) => {
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Unknown error';
  const status = err?.response?.status ?? 0;
  const payload = { message, status };
  const e: any = new Error(message);
  e.status = status;
  e.payload = payload;
  return e;
};

export const campaignsApi = {
  getCampaigns: async (): Promise<{ campaigns: Campaign[]; total?: number }> => {
    try {
      const res = await axiosInstance.get('/campaigns');
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  },

  getCampaignById: async (id: string): Promise<{ campaign: Campaign }> => {
    try {
      const res = await axiosInstance.get(`/campaigns/${id}`);
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  },

  getAggregateInsights: async (): Promise<{ insights: AggregateInsights }> => {
    try {
      const res = await axiosInstance.get('/campaigns/insights');
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  },

  getCampaignInsights: async (id: string): Promise<{ insights: CampaignInsight }> => {
    try {
      const res = await axiosInstance.get(`/campaigns/${id}/insights`);
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  },

  streamCampaignInsights: (id: string): EventSource => {
    const url = `${axiosInstance.defaults.baseURL?.replace(/\/$/, '')}/campaigns/${encodeURIComponent(id)}/insights/stream`;
    return new EventSource(url);
  }
};