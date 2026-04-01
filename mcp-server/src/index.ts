#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Highnote } from "@highnote-ts/highnote-nodejs-sdk";

import { registerAccountHolderTools } from "./tools/accountHolders.js";
import { registerApplicationTools } from "./tools/applications.js";
import { registerCardProductTools } from "./tools/cardProducts.js";
import { registerCardTools } from "./tools/cards.js";
import { registerClientTokenTools } from "./tools/clientTokens.js";
import { registerFinancialAccountTools } from "./tools/financialAccounts.js";
import { registerTransactionTools } from "./tools/transactions.js";

const apiKey = process.env.HIGHNOTE_API_KEY;
if (!apiKey) {
  console.error(
    "HIGHNOTE_API_KEY environment variable is required. Set it before starting the server.",
  );
  process.exit(1);
}

const environment =
  (process.env.HIGHNOTE_ENVIRONMENT as "test" | "live") ?? "test";

const client = new Highnote({
  apiKey,
  environment,
});

const server = new McpServer({
  name: "highnote",
  version: "1.0.0",
});

// Register all tools
registerAccountHolderTools(server, client);
registerApplicationTools(server, client);
registerCardProductTools(server, client);
registerCardTools(server, client);
registerClientTokenTools(server, client);
registerFinancialAccountTools(server, client);
registerTransactionTools(server, client);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
