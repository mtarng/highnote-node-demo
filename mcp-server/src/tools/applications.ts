import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Highnote } from "@mtarng/highnote-sdk";
import { z } from "zod";

export function registerApplicationTools(server: McpServer, client: Highnote) {
  server.tool(
    "highnote_create_application",
    "Create a card product application for an account holder. The application will be reviewed and either approved or denied.",
    {
      accountHolderId: z.string().describe("The account holder ID"),
      cardProductId: z.string().describe("The card product ID to apply for"),
      consentTimestamp: z
        .string()
        .optional()
        .describe(
          "ISO 8601 timestamp of cardholder agreement consent (defaults to now)",
        ),
      primaryAuthorizedPersonId: z
        .string()
        .optional()
        .describe(
          "The primary authorized person ID (defaults to accountHolderId)",
        ),
    },
    async (params) => {
      try {
        const app = await client.applications.create({
          accountHolderId: params.accountHolderId,
          cardProductId: params.cardProductId,
          cardHolderAgreementConsent: {
            consentTimestamp:
              params.consentTimestamp ?? new Date().toISOString(),
            primaryAuthorizedPersonId:
              params.primaryAuthorizedPersonId ?? params.accountHolderId,
          },
        });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(app, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating application: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "highnote_get_application",
    "Get an application by ID to check its status (PENDING, IN_REVIEW, APPROVED, DENIED, CLOSED).",
    {
      applicationId: z.string().describe("The application ID"),
    },
    async ({ applicationId }) => {
      try {
        const app = await client.applications.get(applicationId);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(app, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error getting application: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
