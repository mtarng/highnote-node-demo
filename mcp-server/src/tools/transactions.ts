import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Highnote } from "@mtarng/highnote-sdk";
import { z } from "zod";

export function registerTransactionTools(server: McpServer, client: Highnote) {
  server.tool(
    "highnote_list_transactions",
    "List payment transactions with optional filtering and pagination.",
    {
      pageSize: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Number of results per page (default: 20)"),
      maxResults: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum total results to return (default: 20)"),
    },
    async (params) => {
      try {
        const transactions = [];
        const max = params.maxResults ?? 20;
        for await (const txn of client.transactions.list({
          pageSize: params.pageSize,
        })) {
          transactions.push(txn);
          if (transactions.length >= max) break;
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(transactions, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing transactions: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
