# NexusBuild eBay API Server

Secure Node.js/Express proxy for eBay Browse API. Keeps eBay credentials server-side while exposing safe endpoints for the NexusBuild mobile app.

## Why Application Token (Not User Token)?

This server uses **OAuth Application access token** (`client_credentials` grant) instead of User tokens because:

1. **No user login required** - Works without users signing into eBay
2. **Simpler flow** - No redirect/callback needed
3. **Sufficient for Browse API** - Search and view items works with Application token
4. **Perfect for product search** - Our use case is browsing eBay listings

User tokens would only be needed if we wanted to bid, purchase, or access user-specific data.

## Setup

### 1. Get eBay Developer Credentials

1. Go to [eBay Developer Program](https://developer.ebay.com/)
2. Create an account or sign in
3. Create an application (production keyset)
4. Copy your **Client ID** and **Client Secret**

### 2. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your credentials:

```env
EBAY_ENV=production
EBAY_CLIENT_ID=your-client-id
EBAY_CLIENT_SECRET=your-client-secret
EBAY_MARKETPLACE_ID=EBAY_US
PORT=3000
```

### 3. Install & Run Locally

```bash
# Install dependencies
npm install

# Run with hot reload (dev)
npm run dev

# Or run production
npm start
```

## Deployment

### Environment Variables

Set these variables in your hosting provider's dashboard:

| Variable | Value |
|----------|-------|
| `EBAY_ENV` | `production` |
| `EBAY_CLIENT_ID` | Your eBay Client ID |
| `EBAY_CLIENT_SECRET` | Your eBay Client Secret |
| `EBAY_MARKETPLACE_ID` | `EBAY_US` |
| `PORT` | `3000` |

The server will automatically start using `npm start`.

## API Endpoints

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "ok": true,
  "env": "production",
  "marketplace": "EBAY_US",
  "timestamp": "2024-12-30T20:00:00.000Z"
}
```

### Search eBay Items

```bash
# Basic search
curl "http://localhost:3000/api/ebay/search?q=RTX+4090"

# With limit
curl "http://localhost:3000/api/ebay/search?q=RTX+4090&limit=20"

# With category filter
curl "http://localhost:3000/api/ebay/search?q=nvidia&category=gpu"
```

**Query Parameters:**
- `q` (required): Search keywords
- `limit` (optional): Max results 1-200, default 10
- `category` (optional): PC component category:
  - `gpu`, `cpu`, `motherboard`, `ram`, `storage`, `psu`, `case`, `cooler`, `monitor`

Response:
```json
{
  "total": 1234,
  "count": 10,
  "query": "RTX 4090",
  "category": null,
  "items": [
    {
      "itemId": "v1|123456789|0",
      "title": "NVIDIA GeForce RTX 4090 24GB Graphics Card",
      "price": { "value": "1599.99", "currency": "USD" },
      "image": "https://i.ebayimg.com/...",
      "condition": "New",
      "itemWebUrl": "https://www.ebay.com/itm/...",
      "seller": {
        "username": "techseller123",
        "feedbackPercentage": "99.5",
        "feedbackScore": 5000
      },
      "shippingOptions": { "cost": "0.00", "type": "FREE" },
      "buyingOptions": ["FIXED_PRICE"],
      "itemLocation": "US"
    }
  ]
}
```

### Get Categories

```bash
curl http://localhost:3000/api/ebay/categories
```

## Security Notes

⚠️ **Never expose your Client Secret to clients!**

- Client Secret only lives on this server via environment variables
- Mobile app only calls this server, never eBay directly
- Access token is cached server-side and auto-refreshes

## Project Structure

```
apps/ebay-api/
├── src/
│   ├── server.js    # Express server & routes
│   └── ebay.js      # eBay OAuth & Browse API client
├── .env.example     # Environment template
├── package.json
└── README.md
```
