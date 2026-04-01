import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Highnote } from "@highnote-ts/highnote-nodejs-sdk";
import { PaymentCardClientTokenPermission } from "@highnote-ts/highnote-nodejs-sdk";
import { z } from "zod";

export function registerClientTokenTools(server: McpServer, client: Highnote) {
  server.tool(
    "highnote_create_payment_card_client_token",
    "Generate a client token for a payment card. Used for frontend integrations to securely access card details.",
    {
      paymentCardId: z.string().describe("The payment card ID"),
      permissions: z
        .array(
          z.enum([
            "MANAGE_CARD_FULFILLMENT",
            "MANAGE_PAYMENT_CARD",
            "READ_FULFILLMENT_DETAILS",
            "READ_RESTRICTED_DETAILS",
            "SET_PAYMENT_CARD_PIN",
          ]),
        )
        .min(1)
        .describe("Permissions to grant the token"),
    },
    async (params) => {
      try {
        const mappedPermissions = params.permissions.map(
          (p) =>
            PaymentCardClientTokenPermission[
              p as keyof typeof PaymentCardClientTokenPermission
            ],
        );
        const token = await client.clientTokens.createForPaymentCard({
          paymentCardId: params.paymentCardId,
          permissions: mappedPermissions,
        });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(token, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating client token: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
