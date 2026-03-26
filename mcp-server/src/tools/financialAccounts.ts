import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Highnote } from "@mtarng/highnote-sdk";
import { FinancialAccountSuspensionReasonInput } from "@mtarng/highnote-sdk";
import { z } from "zod";

export function registerFinancialAccountTools(
  server: McpServer,
  client: Highnote,
) {
  server.tool(
    "highnote_issue_financial_account",
    "Issue a financial account for an approved application.",
    {
      applicationId: z
        .string()
        .describe("The approved application ID"),
      name: z.string().describe("Name for the financial account"),
      externalId: z
        .string()
        .max(255)
        .optional()
        .describe("Your external identifier"),
    },
    async (params) => {
      try {
        const account = await client.financialAccounts.issue({
          applicationId: params.applicationId,
          name: params.name,
          ...(params.externalId && { externalId: params.externalId }),
        });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(account, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error issuing financial account: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "highnote_get_financial_account",
    "Get a financial account by ID.",
    {
      financialAccountId: z.string().describe("The financial account ID"),
    },
    async ({ financialAccountId }) => {
      try {
        const account =
          await client.financialAccounts.get(financialAccountId);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(account, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error getting financial account: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "highnote_suspend_financial_account",
    "Suspend a financial account.",
    {
      financialAccountId: z.string().describe("The financial account ID"),
      memo: z.string().max(2048).describe("Reason for suspension"),
      suspensionReason: z
        .enum([
          "ACCOUNT_HOLDER_REQUEST",
          "ACCOUNT_REVIEW",
          "ACH_RETURNS",
          "DELINQUENCY",
          "LOST_OR_STOLEN_CARD",
          "SUSPECTED_FRAUD",
        ])
        .describe("Suspension reason code"),
    },
    async (params) => {
      try {
        const account = await client.financialAccounts.suspend({
          id: params.financialAccountId,
          memo: params.memo,
          suspensionReason:
            FinancialAccountSuspensionReasonInput[
              params.suspensionReason as keyof typeof FinancialAccountSuspensionReasonInput
            ],
        });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(account, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error suspending financial account: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "highnote_unsuspend_financial_account",
    "Unsuspend a previously suspended financial account.",
    {
      financialAccountId: z.string().describe("The financial account ID"),
      memo: z.string().max(2048).describe("Reason for unsuspension"),
    },
    async (params) => {
      try {
        const account = await client.financialAccounts.unsuspend({
          id: params.financialAccountId,
          memo: params.memo,
        });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(account, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error unsuspending financial account: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
