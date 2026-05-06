 audit the root and fix# NStep Android Build Center UI

A local web interface for building Android APKs and AABs for Northern Step Studio applications.

## Quick Start

1. Open a terminal in the root of the workspace.
2. Navigate to the UI directory:
   ```powershell
   cd tools/android-build-center-ui
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Start the UI:
   ```powershell
   npm start
   ```
5. Open your browser to: [http://localhost:4545](http://localhost:4545)

## Features

- **App Selection**: Automatically reads applications from `tools/android-build-center/apps.json`.
- **Live Logs**: Real-time streaming of build output (stdout/stderr) from the PowerShell scripts.
- **Build Types**:
  - **Build APK**: Fast build for local phone testing.
  - **Build AAB**: Signed build for Google Play Store submission.
- **Secure Password Handling**: Enter keystore passwords in the UI; they are passed securely to the build process via environment variables and are never saved or committed.
- **Log Management**: Clear or save build logs to the `logs/` folder for later review.
- **Output Utilities**: Quickly copy the output file path or find where the build artifacts are located.

## Important Notes

- **One Build at a Time**: The system only supports one active build process. Build buttons are disabled during execution.
- **Keystore Security**: Ensure your `.keystore` files are present in `private-keys/android/<app>/`. Do NOT commit these files or their passwords.
- **Android SDK**: Ensure `ANDROID_HOME` is set and `gradlew` can find your Android SDK.
- **Java**: Java 17+ is required for modern React Native builds.

## Troubleshooting

- If the UI shows "Disconnected", ensure the Node.js server is running.
- If the build fails early, check the log panel for specific errors (e.g., missing android folder, missing keystore).
- For deep debugging, you can still run the PowerShell scripts manually from the root:
  ```powershell
  .\tools\android-build-center\build-apk.ps1 neurormoves
  ```

---
© 2026 Northern Step Studio
