# Admin Setup

Use a real password at seed time. Do not rely on a hardcoded default.

## Local

```powershell
$env:NEXUSBUILD_ADMIN_PASSWORD = "replace-with-a-strong-password"
npm run seed:admin
```

## Alternate CLI form

```bash
npm run seed:admin -- --password=replace-with-a-strong-password
```

The script creates or upgrades `admin@nexusbuild.app` by default. Override the email or username with:

```powershell
$env:ADMIN_EMAIL = "owner@example.com"
$env:NEXUSBUILD_ADMIN_USERNAME = "OwnerAccount"
```
