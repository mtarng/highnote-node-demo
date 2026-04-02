import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { desc } from "drizzle-orm";
import { db, schema, sqlite } from "../db/index.js";
import { highnote } from "../services/highnote.js";
import { verifyWebhookSignature } from "@highnote-ts/highnote-nodejs-sdk";
import { WebhookEventsQuerySchema, WebhookRegisterBodySchema } from "../types.js";

const WEBHOOK_SECRET = process.env.HIGHNOTE_WEBHOOK_SECRET;

export async function webhookRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/webhooks — Receive webhook events (public, no JWT)
  typedApp.post("/api/webhooks", {
    schema: {
      tags: ["Webhooks"],
      description: "Receive Highnote webhook events",
    },
  }, async (request, reply) => {
    if (!WEBHOOK_SECRET) {
      request.log.warn("HIGHNOTE_WEBHOOK_SECRET not set — skipping verification");
    }

    const rawBody = (request as { rawBody?: string }).rawBody;
    if (!rawBody) {
      return reply.status(400).send({ error: "Missing request body" });
    }

    // Verify signature if secret is configured
    if (WEBHOOK_SECRET) {
      const signature = request.headers["highnote-signature"] as string | undefined;
      if (!signature) {
        return reply.status(401).send({ error: "Missing highnote-signature header" });
      }

      const result = verifyWebhookSignature({
        payload: rawBody,
        signature,
        secret: WEBHOOK_SECRET,
      });

      if (!result.valid) {
        return reply.status(401).send({ error: "Invalid webhook signature" });
      }
    }

    // Parse and store the event
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return reply.status(400).send({ error: "Invalid JSON payload" });
    }

    const eventType =
      (event.type as string) ??
      ((event.data as Record<string, unknown>)?.type as string) ??
      "UNKNOWN";

    db.insert(schema.webhookEvents).values({
      eventType,
      payload: rawBody,
    }).run();

    request.log.info({ eventType }, "Webhook event received");
    return reply.status(200).send({ received: true });
  });

  // GET /api/webhooks/events — List stored events (JWT-protected)
  typedApp.get("/api/webhooks/events", {
    schema: {
      tags: ["Webhooks"],
      description: "List received webhook events",
      querystring: WebhookEventsQuerySchema,
    },
  }, async (request, reply) => {
    const { limit, offset } = request.query;
    const events = db
      .select()
      .from(schema.webhookEvents)
      .orderBy(desc(schema.webhookEvents.id))
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = sqlite
      .prepare("SELECT COUNT(*) as count FROM webhook_events")
      .get() as { count: number };

    return reply.send({
      events,
      total: countResult.count,
      limit,
      offset,
    });
  });

  // POST /api/webhooks/register — Register webhook target (JWT-protected)
  typedApp.post("/api/webhooks/register", {
    schema: {
      tags: ["Webhooks"],
      description: "Register a webhook notification target with Highnote",
      body: WebhookRegisterBodySchema,
    },
  }, async (request, reply) => {
    const { name, subscriptions } = request.body;

    // Build the webhook URL from the request origin
    const protocol = request.headers["x-forwarded-proto"] ?? "https";
    const host = request.headers["x-forwarded-host"] ?? request.headers.host;
    const webhookUrl = `${protocol}://${host}/api/webhooks`;

    try {
      const target = await highnote.webhooks.add({
        name,
        uri: webhookUrl,
        subscriptions: subscriptions as never[],
      });

      return reply.status(201).send({
        id: target.id,
        name: target.name,
        uri: target.uri,
        status: target.status,
        signingKeys: (target as Record<string, unknown>).signingKeys,
        message: "Webhook registered. Copy the signing secret from signingKeys and set it as HIGHNOTE_WEBHOOK_SECRET in your Render environment variables.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to register webhook";
      return reply.status(500).send({ error: message });
    }
  });
}
