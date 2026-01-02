import { useEffect, useRef } from 'react';
import { campaignsApi } from '../api/campaigns';
import { CampaignInsight } from '@/types/types';

type Handler = (payload: CampaignInsight) => void;

export const useCampaignSSE = (campaignId: string | null, onMessage: Handler) => {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    const es = campaignsApi.streamCampaignInsights(campaignId);
    esRef.current = es;

    const handleEvent = (ev: MessageEvent) => {
      try {
        const parsed = JSON.parse(ev.data) as CampaignInsight;
        onMessage(parsed);
      } catch (e) {
        // ignore parse errors
      }
    };

    es.addEventListener('message', handleEvent);
    es.addEventListener('error', () => {
      // SSE errors: close and cleanup, consumer can reconnect
      // console.error('SSE error for', campaignId);
      es.close();
    });

    return () => {
      es.removeEventListener('message', handleEvent);
      es.close();
    };
  }, [campaignId, onMessage]);
};