# App Store Distribution Assets

## iOS (TestFlight / App Store)

### Required Assets
- [x] **App Icon**: 1024x1024 PNG (no transparency, no rounded corners) - *Generated in `docs/assets/app_icon.png`*
- [ ] **Screenshots** (iPhone 6.7" - 1290x2796):
  - Home screen with build options
  - Builder screen with parts
  - AI Chat conversation
  - Deals/price tracking
  - Community builds gallery
- [ ] **Screenshots** (iPad 12.9" - 2048x2732):
  - Same 5 screenshots optimized for iPad

### App Store Connect Metadata
```
App Name: NexusBuild - PC Builder
Subtitle: Build Your Dream PC
Category: Utilities / Shopping
Keywords: pc, builder, gaming, computer, parts, compatibility, nvidia, amd, intel

Description:
Build your dream gaming PC with NexusBuild! Our AI-powered app helps you:

✓ Choose compatible parts
✓ Track prices across retailers
✓ Get personalized recommendations
✓ Share builds with the community

Features:
• Smart Compatibility Checker
• Real-time Price Tracking
• AI Build Assistant (Nexus)
• 60+ Component Database
• Affiliate Links to Top Retailers
```

### Required for Submission
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Apple Developer account ($99/year)

---

## Android (Play Store)

### Required Assets
- [x] **App Icon**: 512x512 PNG - *Use `docs/assets/app_icon.png` (resize needed)*
- [x] **Feature Graphic**: 1024x500 PNG - *Generated in `docs/assets/feature_graphic.png`*
- [ ] **Screenshots** (phone - min 2):
  - 1080x1920 or similar
  - Same 5 screens as iOS
- [ ] **Screenshots** (tablet - optional):
  - 1920x1080 or similar

### Play Console Metadata
```
App Name: NexusBuild - PC Builder
Short Description: AI-powered PC building companion
Full Description: (same as iOS)

Category: Tools or Shopping
Content Rating: Everyone
```

### Required for Submission
- [ ] Privacy Policy URL
- [ ] Google Play Developer account ($25 one-time)

---

## Current Status

### What's Ready
- ✅ App functionality complete
- ✅ API backend deployed
- ✅ Web landing page with app links

### What's Needed
- ⏳ App icons (can generate with AI)
- ⏳ Screenshots (can capture from running app)
- ⏳ Privacy policy page
- ⏳ Developer accounts

## Quick Commands

### Build for iOS
```bash
cd mobile
npx expo build:ios
# or for EAS Build:
eas build --platform ios
```

### Build for Android
```bash
cd mobile
npx expo build:android
# or for EAS Build:
eas build --platform android
```
