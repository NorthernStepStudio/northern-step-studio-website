const path = require('path');
const { spawnSync } = require('child_process');

const androidDir = path.join(__dirname, '..', 'android');
const gradleCommand =
    process.platform === 'win32'
        ? path.join(androidDir, 'gradlew.bat')
        : path.join(androidDir, 'gradlew');
const command = process.platform === 'win32' ? 'cmd.exe' : gradleCommand;
const gradleArgs = ['clean', 'bundleRelease'];

if (process.platform === 'win32' && process.env.LOCAL_AAB_ENABLE_NEW_ARCH !== '1') {
    // Deep Windows checkouts can exceed MAX_PATH in generated New Architecture C++ paths.
    gradleArgs.push('-PnewArchEnabled=false');
}

const args =
    process.platform === 'win32'
        ? ['/d', '/c', 'gradlew.bat', ...gradleArgs]
        : gradleArgs;

const env = {
    ...process.env,
    EXPO_NO_METRO_WORKSPACE_ROOT:
        process.env.EXPO_NO_METRO_WORKSPACE_ROOT || '1',
    NODE_ENV: process.env.NODE_ENV || 'production',
    SENTRY_DISABLE_AUTO_UPLOAD:
        process.env.SENTRY_DISABLE_AUTO_UPLOAD || 'true',
};

const result = spawnSync(command, args, {
    cwd: androidDir,
    env,
    stdio: 'inherit',
});

if (result.error) {
    console.error(result.error.message);
    process.exit(1);
}

if (result.signal) {
    console.error(`Gradle build stopped by signal ${result.signal}`);
    process.exit(1);
}

process.exit(result.status ?? 1);
