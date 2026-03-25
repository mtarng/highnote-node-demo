# Highnote Demo API

A Fastify + SQLite (Drizzle ORM) REST API for a consumer prepaid card management dashboard, powered by the Highnote Node SDK.

## Quick Start

### Prerequisites

- Node.js 22+
- A Highnote test API key (from [dashboard.highnote.com](https://dashboard.highnote.com))
- A card product ID from your Highnote dashboard

### Setup

```bash
# From the repo root, build the SDK first
npm run build

# Set up the demo API
cd demo/api
cp .env.template .env
# Edit .env with your HIGHNOTE_API_KEY and HIGHNOTE_CARD_PRODUCT_ID

npm install
```

### Run (development)

```bash
npm run dev
```

### Run (production)

```bash
npm run build
npm start
```

### Run (Docker)

```bash
cd demo
docker compose up --build
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/account-holders` | Create US person account holder |
| GET | `/api/account-holders/:id` | Get account holder by Highnote ID |
| GET | `/api/account-holders` | List account holders (local DB) |
| POST | `/api/applications` | Create card product application |
| GET | `/api/applications/:id` | Get application status |
| POST | `/api/financial-accounts` | Issue financial account |
| GET | `/api/financial-accounts/:id` | Get financial account |
| POST | `/api/cards` | Issue a payment card |
| POST | `/api/cards/:id/activate` | Activate a card |
| POST | `/api/cards/:id/suspend` | Suspend a card |
| GET | `/api/cards/:id` | Get card details |
| GET | `/api/cards` | List cards (local DB) |
| GET | `/api/transactions` | List transactions |
| POST | `/api/client-tokens` | Generate client token |

## Example: Full Card Issuance Flow

```bash
# 1. Create an account holder
curl -X POST http://localhost:3000/api/account-holders \
  -H "Content-Type: application/json" \
  -d '{
    "givenName": "Jane",
    "familyName": "Doe",
    "dateOfBirth": "1990-01-15",
    "email": "jane@example.com",
    "streetAddress": "123 Main St",
    "locality": "San Francisco",
    "region": "CA",
    "postalCode": "94105",
    "phoneNumber": "5551234567",
    "ssn": "123-45-6789"
  }'

# 2. Create an application (use the highnote_id from step 1)
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "accountHolderId": "ahn_..."
  }'

# 3. Poll for approval
curl http://localhost:3000/api/applications/app_...

# 4. Issue a financial account (once application is APPROVED)
curl -X POST http://localhost:3000/api/financial-accounts \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "app_...",
    "name": "Main Spending Account"
  }'

# 5. Issue a card
curl -X POST http://localhost:3000/api/cards \
  -H "Content-Type: application/json" \
  -d '{
    "financialAccountId": "fa_..."
  }'

# 6. Generate a client token for the frontend
curl -X POST http://localhost:3000/api/client-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "paymentCardId": "pc_..."
  }'
```
