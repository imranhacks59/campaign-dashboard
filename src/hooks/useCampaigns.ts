import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaigns';
import { Campaign } from '@/types/types';

export const useCampaigns = () =>
  useQuery<{ campaigns: Campaign[]; total?: number }, Error>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await campaignsApi.getCampaigns();
      return res;
    },
    staleTime: 1000 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
  });