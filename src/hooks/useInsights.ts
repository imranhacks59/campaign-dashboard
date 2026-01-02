import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaigns';
import { AggregateInsights } from '@/types/types';

export const useAggregateInsights = () =>
  useQuery<{ insights: AggregateInsights }, Error>({
    queryKey: ['insights', 'aggregate'],
    queryFn: async () => {
      const res = await campaignsApi.getAggregateInsights();
      return res;
    },
    staleTime: 1000 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
  });