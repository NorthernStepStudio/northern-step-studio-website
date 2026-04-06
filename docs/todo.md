# Todo

## Important Notes

**Feature Toggle Behavior:**
- Owner and Admin users can ALWAYS see all features, even when disabled
- This allows you to preview/test features before enabling them for public
- Regular users (moderator/user role) and logged-out visitors respect toggle settings
- To verify toggles work: view published site in incognito window or as a test user
- Dev and Prod databases are separate - toggle settings must be changed in each environment
## Recently Completed
- ✅ Feature toggle system with admin control panel
  - Created feature_toggles table with entries for all pages/features
  - Built admin settings page at /admin/settings (owner/admin only)
  - Implemented FeatureGate component for hiding UI elements
  - Implemented ProtectedRoute wrapper for route-level protection
  - Owner/admin bypass all toggles (always see everything)
  - Moderators/users can only access enabled features
  - Navigation links auto-hide based on toggle status
- ✅ Fixed GlitchedText animation to start reliably on page load
- ✅ Restructured homepage with new hero: "Building Intelligent Software & Revenue Infrastructure"
- ✅ Replaced 4 pillars with 3 core divisions:
  - NSS Studio (Mobile apps & games)
  - NSS AI Systems (AI automation frameworks)
  - ResponseOS (dominant yellow theme, lead automation system)
- ✅ Created dedicated /responseos page with:
  - Full product explanation
  - 3-tier installation pricing ($750/$1,500/$3,000)
  - Monthly subscription tiers ($97/$197/$297)
  - Optional optimization service
  - ROI calculator section
  - FAQ section
- ✅ Removed "Website Services" pillar (repositioned as product infrastructure company)
- ✅ Updated stats to reflect 3 divisions instead of 4
- ✅ Added ResponseOS CTA to hero section
- ✅ Owner role system with complete control hierarchy
