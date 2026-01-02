import { useEffect, useRef } from 'react';
import { campaignsApi } from '../api/campaigns';
import type { CampaignInsight } from '../types';

type Handler = (payload: CampaignInsight) => void;

/**
 * Subscribes to campaign SSE for a given campaignId.
 * - Guarantees any previous EventSource is closed before opening a new one.
 * - Only invokes onMessage for events whose payload.campaign_id matches the requested campaignId.
 * - Minimizes effect re-creation by depending only on campaignId.
 */
export const useCampaignSSE = (campaignId: string | null, onMessage: Handler) => {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Close any previously-open stream
    if (esRef.current) {
      try {
        esRef.current.close();
      } catch (e) {}
      esRef.current = null;
    }

    if (!campaignId) {
      return;
    }

    // Create a fresh EventSource for the requested campaign id
    const es = campaignsApi.streamCampaignInsights(campaignId);
    esRef.current = es;

    const handleEvent = (ev: MessageEvent) => {
      try {
        const parsed = JSON.parse(ev.data) as CampaignInsight;
        // Only deliver events that match the currently subscribed campaign id
        if (parsed?.campaign_id === campaignId) {
          onMessage(parsed);
        } else {
          // Helpful debug logging when backend sends unexpected campaign ids
          // eslint-disable-next-line no-console
          console.warn('[SSE] Ignored payload for', parsed?.campaign_id, 'while subscribed to', campaignId);
        }
      } catch (e) {
        // ignore parse errors
      }
    };

    const handleError = (err: any) => {
      // eslint-disable-next-line no-console
      console.warn('[SSE] error for', campaignId, err);
      try {
        es.close();
      } catch (e) {}
    };

    es.addEventListener('message', handleEvent);
    es.addEventListener('error', handleError);

    return () => {
      es.removeEventListener('message', handleEvent);
      es.removeEventListener('error', handleError);
      try {
        es.close();
      } catch (e) {}
      if (esRef.current === es) esRef.current = null;
    };
    // We intentionally depend only on campaignId to avoid re-creating channels when
    // the onMessage handler function is re-created by parent renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);
};