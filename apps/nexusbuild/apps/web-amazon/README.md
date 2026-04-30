# NexusBuild Web (Amazon-Compliant)

This is the Amazon-compliant web version for affiliate approval.

## Features

- ✅ Preview badge in header and footer
- ✅ "NexusBuild is in Preview" disclaimer
- ✅ "As an Amazon Associate, I earn from qualifying purchases" disclosure
- ✅ No live deals or price tracking claims
- ✅ Clean, professional design

## Pages

- `/` - Homepage
- `/builder` - PC Builder
- `/about` - About Us
- `/disclosure` - Affiliate Disclosure
- `/legal` - Privacy Policy
- `/terms` - Terms of Service

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Vercel

### Option 1: Via GitHub

1. Push this folder to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the GitHub repo
4. Select the `web-amazon` folder as root
5. Deploy!

### Option 2: Via CLI

```bash
npm i -g vercel
vercel
```

## Domain DNS Setup

### For Apex Domain (nexusbuild.com)

Add an **A Record**:
- **Type**: A
- **Name**: @
- **Value**: 76.76.21.21

### For Subdomain (www.nexusbuild.com)

Add a **CNAME Record**:
- **Type**: CNAME
- **Name**: www
- **Value**: cname.vercel-dns.com

### Both (Recommended)

Set up both, then configure redirect in Vercel:
- Go to Vercel Dashboard → Project → Domains
- Add both `nexusbuild.com` and `www.nexusbuild.com`
- Set primary and enable redirect

## After Deployment

1. Verify all pages load correctly
2. Test on mobile
3. Submit to Amazon Associates with the Vercel URL
4. Once approved, add real affiliate links
