import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaigns';
import { CampaignInsight } from '@/types/types';

/**
 * Fetches a single campaign's insights (snapshot) via REST.
 * Returns a react-query result; disabled when id is falsy.
 */
export const useCampaignInsights = (campaignId: string | null) =>
  useQuery<{ insights: CampaignInsight }, Error>({
    queryKey: ['campaign', campaignId, 'insights'],
    queryFn: async () => {
      if (!campaignId) throw new Error('No campaign id');
      const res = await campaignsApi.getCampaignInsights(campaignId);
      return res;
    },
    enabled: !!campaignId,
    staleTime: 1000 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
  });