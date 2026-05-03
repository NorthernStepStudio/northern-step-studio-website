# ProvLy App Documentation

## Overview

**ProvLy** is a privacy-first home inventory app designed to help homeowners document their belongings for insurance claims. The app is built with React Native/Expo and follows a "local-first" architecture where all data is stored on the device.

---

## Core Features

### 1. Home Management
- **Multiple Homes**: Users can manage multiple properties (e.g., main home, vacation home, rental)
- **Home Switcher**: Quick toggle between homes in the Vault/Manage Rooms screen
- **Per-Home Stats**: Each home shows its own item count, value, and coverage score

### 2. Room Organization
- **Create Rooms**: Add rooms like Kitchen, Living Room, Bedroom, Garage, etc.
- **Room Icons**: Each room has an icon for visual navigation
- **Reorder Rooms**: Drag-and-drop to prioritize rooms
- **Delete Rooms**: Remove rooms (with option to keep/delete items inside)

### 3. Item Tracking
- **Add Items**: Via camera scan or manual entry
- **Item Details**:
  - Name and description
  - Category (Electronics, Furniture, Clothing, etc.)
  - Purchase price and date
  - Serial number
  - Notes
  - Quantity
- **Photos**: Attach multiple photos as proof of ownership
- **Receipts**: Store receipt images for warranty/claim proof

### 4. Camera Scan
- **Live Camera**: Real-time camera preview for quick scanning
- **Photo Capture**: Take photos directly in the app
- **Quick Add**: Streamlined flow from photo to item creation

### 5. Claim Center
- **Proof Health Score**: Visual indicator of documentation completeness
- **Missing Items Report**: Shows items without photos/receipts
- **Export Options**:
  - **PDF Report**: Full inventory with photos, room-by-room
  - **CSV Export**: Spreadsheet for detailed analysis
  - **ZIP Pack**: All photos bundled for claims

### 6. Home Dashboard
- **Inventory Snapshot**: Quick stats (items, value, coverage)
- **Quick Shortcuts**: Fast access to common actions
- **Recent Activity**: Recently added/modified items
- **Proof Health Badge**: Visual claim readiness indicator

---

## Screens Reference

| Screen | Purpose | Navigation |
|--------|---------|------------|
| HomeScreen | Main dashboard with stats and shortcuts | Bottom Tab "Home" |
| ManageRoomsScreen | View/edit rooms, manage homes | Bottom Tab "Vault" |
| ChatScreen | AI assistant for help and questions | Bottom Tab "ProChat" |
| CameraScanScreen | Add items via camera | Bottom Tab "Scan" |
| SettingsScreen | Profile, preferences, security | Bottom Tab "Profile" |
| ClaimCenterScreen | Export reports, check proof status | Via Home or Settings |
| AddItemScreen | Manual item entry | Via + buttons |
| AddRoomScreen | Create new rooms | Via Manage Rooms |
| ItemDetailScreen | View/edit item details | Tap on item |
| RoomDetailScreen | View items in a room | Tap on room |
| AuthScreen | Login/signup | Before authenticated |
| UpgradeScreen | Pro subscription info | Via locked features |
| LegalScreen | Terms, privacy, liability | Via Settings or Auth |
| AppLockScreen | Biometric authentication | On app launch (if enabled) |
| IntroScreen | Video intro on first launch | App start |

---

## Subscription Tiers

### Free Tier
- ✅ Unlimited items
- ✅ Unlimited rooms
- ✅ Unlimited homes
- ✅ Local storage
- ✅ Basic exports (limited)

### Pro Tier ($6.99/mo or $69.99/yr)
- ✅ Everything in Free
- ✅ **Unlimited Exports**
- ✅ **Cloud Sync & Backup**
- ✅ **ZIP Claim Packs** (photos included)
- ✅ **Priority Support**

---

## Data Architecture

### Local-First Philosophy
- All data stored in SQLite on device
- No data leaves without explicit user action
- Optional cloud sync for Pro users
- End-to-end encryption for synced data

### Database Tables
- **homes**: Properties with name, address
- **rooms**: Rooms belonging to homes
- **items**: Individual possessions with details
- **media**: Photos attached to items

### FactPack (Chat Context)
The chat system uses a `FactPack` to provide personalized responses:
```typescript
{
  total_items: number,      // Count of all items
  total_value: number,      // Sum of purchase prices
  items_missing_proof: number,  // Items without photos
  high_value_items: string[],   // Names of expensive items
  rooms_count: number,      // Number of rooms
  recent_items: string[]    // Recently added items
}
```

---

## Common User Questions

### Inventory
- "How many items do I have?"
- "What's my total value?"
- "Show me my inventory summary"
- "What items are missing photos?"

### Claims & Insurance
- "How do I file a claim?"
- "What do I need for insurance?"
- "My house was [flooded/damaged/robbed]"
- "Help me prepare for a claim"

### Organization
- "How do I add a room?"
- "How do I organize my items?"
- "Can I move items between rooms?"

### Export
- "Export my inventory"
- "Generate a PDF report"
- "Download my data"

### Settings & Account
- "How do I enable biometric lock?"
- "How do I upgrade to Pro?"
- "Where are my settings?"

---

## Navigation Structure

```
App
├── Auth (unauthenticated)
│   └── AuthScreen
├── Main (authenticated)
│   ├── BottomTabNavigator
│   │   ├── HomeTab → HomeScreen
│   │   ├── RoomsTab → ManageRoomsScreen
│   │   ├── ChatTab → ChatScreen (center, hero button)
│   │   ├── ScanTab → CameraScanScreen
│   │   └── SettingsTab → SettingsScreen / ProfileScreen
│   └── Stack Screens
│       ├── AddItem
│       ├── AddRoom
│       ├── ItemDetail
│       ├── RoomDetail
│       ├── ClaimCenter
│       ├── Upgrade
│       └── Legal
└── Modals
    └── AppLockScreen (biometric)
```

---

## Privacy & Security

### Data Control
- **Your Data, Your Device**: All data stored locally by default
- **No Tracking**: No analytics or behavioral tracking
- **End-to-End Encryption**: Synced data encrypted before upload
- **Biometric Lock**: Optional Face ID/Touch ID protection

### What We Never Do
- ❌ Sell user data
- ❌ Access photos without permission
- ❌ Upload data without explicit consent
- ❌ Track location beyond local use

---

## Feature Flags

The app uses feature flags for gradual rollout:
```typescript
FEATURES = {
  ENABLE_AI_CHAT: true,       // Cloud AI assistant
  ENABLE_RULES_CHAT: false,   // Local rules-based assistant
  ENABLE_SMART_SCAN: false,   // AI-powered photo analysis
  ENABLE_RULES_HELPER: true   // Keyword-based tips
}
```

---

## Localization

Supported languages:
- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇮🇹 Italian (it)

Language can be changed in Settings.

---

## Support

For help within the app:
1. Open the Chat (ProChat tab)
2. Ask any question about inventory, claims, or features
3. Use suggested prompts for common tasks

For technical support:
- Check Settings → Support section
- Export diagnostic info if needed
