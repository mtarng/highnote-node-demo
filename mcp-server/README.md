# Highnote MCP Server

An MCP (Model Context Protocol) server that wraps the [Highnote Node SDK](https://github.com/bay1inc/highnote-nodejs-sdk) so that Claude or any MCP client can manage Highnote resources conversationally.

## Available Tools

| Tool | Description |
|------|-------------|
| `highnote_create_us_person_account_holder` | Create a US person account holder |
| `highnote_get_account_holder` | Get an account holder by ID |
| `highnote_list_person_account_holders` | List person account holders |
| `highnote_create_application` | Create a card product application |
| `highnote_get_application` | Get application status |
| `highnote_list_card_products` | List available card products |
| `highnote_issue_financial_account` | Issue a financial account for an approved application |
| `highnote_get_financial_account` | Get a financial account by ID |
| `highnote_suspend_financial_account` | Suspend a financial account |
| `highnote_unsuspend_financial_account` | Unsuspend a financial account |
| `highnote_issue_card` | Issue a payment card |
| `highnote_activate_card` | Activate a payment card |
| `highnote_suspend_card` | Suspend a payment card |
| `highnote_close_card` | Close a payment card |
| `highnote_get_card` | Get a payment card by ID |
| `highnote_create_payment_card_client_token` | Generate a client token for frontend use |
| `highnote_list_transactions` | List payment transactions |

## Setup

### 1. Install dependencies

```bash
cd demo/mcp-server
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Configure in Claude Code

Add the following to your `.claude/settings.json`:

```json
{
  "mcpServers": {
    "highnote": {
      "command": "node",
      "args": ["./demo/mcp-server/dist/index.js"],
      "env": {
        "HIGHNOTE_API_KEY": "sk_test_..."
      }
    }
  }
}
```

Or for development with `tsx`:

```json
{
  "mcpServers": {
    "highnote": {
      "command": "npx",
      "args": ["tsx", "./demo/mcp-server/src/index.ts"],
      "env": {
        "HIGHNOTE_API_KEY": "sk_test_..."
      }
    }
  }
}
```

## Example Usage

Once configured, you can interact with Highnote resources using natural language in Claude Code:

**List card products:**
> "What card products are available?"

Claude will call `highnote_list_card_products` and display the results.

**Create an account holder and issue a card:**
> "Create a new account holder named Jane Doe, born 1990-01-15, at 123 Main St, San Francisco CA 94105, with SSN 123-45-6789 and phone 555-123-4567."

Claude will call `highnote_create_us_person_account_holder` with the provided details.

**Full card issuance flow:**
> "Apply for card product cp_123 for account holder ah_456, then once approved, issue a financial account and a virtual card."

Claude will orchestrate calls to `highnote_create_application`, poll `highnote_get_application` for approval, then call `highnote_issue_financial_account` and `highnote_issue_card`.

**Check transactions:**
> "Show me the last 10 transactions."

Claude will call `highnote_list_transactions` with `maxResults: 10`.
