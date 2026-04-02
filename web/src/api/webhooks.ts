import { request } from "./client";

export interface WebhookEvent {
  id: number;
  eventType: string;
  payload: string;
  receivedAt: string;
}

export interface WebhookEventsResponse {
  events: WebhookEvent[];
  total: number;
  limit: number;
  offset: number;
}

export function getWebhookEvents(limit = 50, offset = 0) {
  return request<WebhookEventsResponse>(
    `/api/webhooks/events?limit=${limit}&offset=${offset}`,
  );
}
