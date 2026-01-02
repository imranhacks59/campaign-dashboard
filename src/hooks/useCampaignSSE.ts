import { useEffect, useRef } from 'react';
import { campaignsApi } from '../api/campaigns';
import { CampaignInsight } from '@/types/types';

type Handler = (payload: CampaignInsight) => void;
type ErrorHandler = (err: { status?: number; message?: string; timestamp?: string; raw?: any }) => void;


export const useCampaignSSE = (
  campaignId: string | null,
  onMessage: Handler,
  onError?: ErrorHandler
) => {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Close any previously-open stream
    if (esRef.current) {
      try {
        esRef.current.close();
      } catch (e) {
        // ignore close errors
      }
      esRef.current = null;
    }

    if (!campaignId) {
      // nothing to subscribe to
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
          // eslint-disable-next-line no-console
          console.warn('[SSE] Ignored payload for', parsed?.campaign_id, 'while subscribed to', campaignId);
        }
      } catch (e) {
        // parsing failed — surface raw data to onError if provided
        if (onError) {
          onError({ message: 'Failed to parse SSE payload', raw: ev.data });
        }
      }
    };

    const handleError = (ev: any) => {
      // Try to read a JSON body from the event if available (some servers send an error event with data)
      try {
        const data = ev?.data;
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (onError) onError({ status: parsed?.status, message: parsed?.message || parsed?.error, timestamp: parsed?.timestamp, raw: parsed });
            return;
          } catch {
            // not JSON
          }
        }
      } catch {
        /* ignore */
      }

      // Generic error fallback
      if (onError) {
        onError({ message: 'SSE connection error', raw: ev });
      }

      // Close the stream on error (server unreachable / closed)
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
    // Intentionally depend only on campaignId so we don't recreate when parent re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);
};