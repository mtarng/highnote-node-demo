import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Highnote } from "@highnote-ts/highnote-nodejs-sdk";
import { z } from "zod";

export function registerCardTools(server: McpServer, client: Highnote) {
  server.tool(
    "highnote_issue_card",
    "Issue a payment card for a financial account.",
    {
      financialAccountId: z
        .string()
        .describe("The financial account ID to issue the card for"),
      activateOnCreate: z
        .boolean()
        .describe("Whether to activate the card immediately"),
      expirationDate: z
        .string()
        .describe(
          "Card expiration date in ISO 8601 format (e.g. 2028-12-31T00:00:00Z)",
        ),
      cardProfileSetId: z
        .string()
        .optional()
        .describe("Optional card profile set ID"),
      externalId: z
        .string()
        .max(255)
        .optional()
        .describe("Your external identifier"),
    },
    async (params) => {
      try {
        const card = await client.cards.issue({
          financialAccountId: params.financialAccountId,
          options: {
            activateOnCreate: params.activateOnCreate,
            expirationDate: params.expirationDate,
            ...(params.cardProfileSetId && {
              cardProfileSetId: params.cardProfileSetId,
            }),
            ...(params.externalId && { externalId: params.externalId }),
          },
        });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(card, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error issuing card: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "highnote_activate_card",
    "Activate a payment card that is in ACTIVATION_REQUIRED status.",
    {
      paymentCardId: z.string().describe("The payment card ID to activate"),
    },
    async ({ paymentCardId }) => {
      try {
        const result = await client.cards.activate({ paymentCardId });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error activating card: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "highnote_suspend_card",
    "Suspend an active payment card.",
    {
      paymentCardId: z.string().describe("The payment card ID to suspend"),
    },
    async ({ paymentCardId }) => {
      try {
        const result = await client.cards.suspend({ paymentCardId });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error suspending card: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "highnote_close_card",
    "Permanently close a payment card. This action cannot be undone.",
    {
      paymentCardId: z.string().describe("The payment card ID to close"),
    },
    async ({ paymentCardId }) => {
      try {
        const result = await client.cards.close({ paymentCardId });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error closing card: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "highnote_get_card",
    "Get a payment card by ID.",
    {
      paymentCardId: z.string().describe("The payment card ID"),
    },
    async ({ paymentCardId }) => {
      try {
        const card = await client.cards.get(paymentCardId);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(card, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error getting card: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
