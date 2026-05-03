const { withAndroidStyles, withAndroidColors } = require("@expo/config-plugins");

/**
 * Sets android:windowBackground to a custom color to prevent white flashes
 * during native-stack transitions on Android.
 *
 * Usage in app.json/app.config.js:
 * [
 *   "./plugins/withAndroidWindowBackground",
 *   { color: "#0B1220", colorName: "app_background" }
 * ]
 */
module.exports = function withAndroidWindowBackground(config, props = {}) {
    const color = props.color || "#0B1220";
    const colorName = props.colorName || "app_background";

    // 1) Ensure the color exists in colors.xml
    config = withAndroidColors(config, (config) => {
        const colors = config.modResults;

        // Find existing entry
        const existing = colors.resources.color?.find((c) => c.$?.name === colorName);

        if (existing) {
            existing._ = color;
        } else {
            if (!colors.resources.color) colors.resources.color = [];
            colors.resources.color.push({ $: { name: colorName }, _: color });
        }

        return config;
    });

    // 2) Set android:windowBackground in styles.xml (AppTheme)
    config = withAndroidStyles(config, (config) => {
        const styles = config.modResults;
        const styleList = styles.resources.style || [];

        // Try common theme names (Expo varies by template/version)
        const themeNamesToTry = ["AppTheme", "Theme.App.SplashScreen", "MainTheme"];
        let targetTheme = null;

        for (const name of themeNamesToTry) {
            const found = styleList.find((s) => s.$?.name === name);
            if (found) {
                targetTheme = found;
                break;
            }
        }

        // Fallback: just use the first theme if none matched
        if (!targetTheme && styleList.length > 0) targetTheme = styleList[0];

        if (!targetTheme) return config;

        if (!targetTheme.item) targetTheme.item = [];

        const itemName = "android:windowBackground";
        const value = `@color/${colorName}`;

        const existingItem = targetTheme.item.find((i) => i.$?.name === itemName);
        if (existingItem) {
            existingItem._ = value;
        } else {
            targetTheme.item.push({ $: { name: itemName }, _: value });
        }

        return config;
    });

    return config;
};
