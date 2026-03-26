import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Highnote } from "@mtarng/highnote-sdk";
import { z } from "zod";

export function registerCardProductTools(server: McpServer, client: Highnote) {
  server.tool(
    "highnote_list_card_products",
    "List available card products. Use this to find a cardProductId for creating applications.",
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
        const products = [];
        const max = params.maxResults ?? 20;
        for await (const product of client.cardProducts.list({
          pageSize: params.pageSize,
        })) {
          products.push(product);
          if (products.length >= max) break;
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(products, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing card products: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
