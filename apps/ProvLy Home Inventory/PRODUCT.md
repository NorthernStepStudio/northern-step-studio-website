# ProvLy Product Spec

## Vision
Privacy-first home inventory for insurance claims + maintenance.

## MVP Features
- Homes / Rooms / Items CRUD
- Photo + document attach (receipt/warranty/manual)
- Claim Pack export (PDF + CSV + ZIP)
- Maintenance reminders
- AI assist (opt-in): receipt parsing, video scan

## Subscription Tiers

| Feature | Free | Plus ($4.99/mo) | Pro ($9.99/mo) |
|---------|------|-----------------|----------------|
| Items | 50 | 500 | Unlimited |
| Homes | 1 | 3 | Unlimited |
| Exports/month | 2 | 10 | Unlimited |
| AI parsing | ❌ | ✅ | ✅ |
| Video scan | ❌ | ❌ | ✅ |
| Priority support | ❌ | ❌ | ✅ |

## Design Principles
1. **Data ownership**: Export anytime, even on Free
2. **Privacy**: AI opt-in, no data selling
3. **Reliability**: Offline-first capture
4. **Upgrade later**: S3-compatible storage, API abstraction
