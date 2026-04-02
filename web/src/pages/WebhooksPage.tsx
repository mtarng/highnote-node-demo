import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavBar } from "../components/NavBar";
import { PageHeader } from "../components/PageHeader";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { getWebhookEvents } from "../api/webhooks";

export function WebhooksPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["webhook-events"],
    queryFn: () => getWebhookEvents(),
    refetchInterval: 10_000,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <PageHeader title="Webhook Events" showBack />
        <p className="text-sm text-gray-500 mb-6">
          Events received from Highnote webhooks. Auto-refreshes every 10 seconds.
        </p>

        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error.message} />}

        {data && data.events.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">No webhook events yet</p>
            <p className="text-sm mt-1">
              Register a webhook target and trigger events to see them here.
            </p>
          </div>
        )}

        {data && data.events.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 mb-3">
              {data.total} total event{data.total !== 1 ? "s" : ""}
            </p>
            {data.events.map((event) => {
              const isExpanded = expandedId === event.id;
              let parsedPayload: string;
              try {
                parsedPayload = JSON.stringify(JSON.parse(event.payload), null, 2);
              } catch {
                parsedPayload = event.payload;
              }

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                        {event.eventType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(event.receivedAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {isExpanded ? "\u25BC" : "\u25B6"}
                    </span>
                  </button>
                  {isExpanded && (
                    <pre className="px-4 pb-4 text-xs text-gray-600 overflow-x-auto bg-gray-50 mx-4 mb-4 rounded-md p-3">
                      {parsedPayload}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
