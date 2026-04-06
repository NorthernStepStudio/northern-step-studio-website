const packageJson = require("./package.json");

const defaultWebAdminConsoleUrl =
  "https://northernstepstudio.com/apps/nexusbuild/app/admin";
const defaultEasProjectId =
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
  "4442b336-9701-4066-a405-0a58210ef142";
const defaultEasOwner = process.env.EXPO_PUBLIC_EAS_OWNER || "northernstep";

module.exports = ({ config = {} }) => {
  const expo = config.expo || {};
  const extra = expo.extra || {};
  const version = packageJson.version || expo.version || "0.0.0";

  return {
    name: "NexusBuild",
    slug: "nexusbuild-mobile-v6",
    version,
    scheme: "nexusbuild",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0a0f1e",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "app.nexusbuild.mobile",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0a0f1e",
      },
      package: "app.nexusbuild.mobile",
    },
    web: {
      favicon: "./assets/favicon.png",
      splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#0a0f1e",
      },
    },
    plugins: [
      [
        "expo-font",
        {
          fonts: ["./assets/fonts/Ionicons.ttf"],
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#ffffff",
        },
      ],
    ],
    extra: {
      ...extra,
      appVersion: version,
      apiBaseUrl:
        process.env.EXPO_PUBLIC_API_BASE_URL || extra.apiBaseUrl || "",
      localApiBaseUrl:
        process.env.EXPO_PUBLIC_LOCAL_API_BASE_URL ||
        extra.localApiBaseUrl ||
        "",
      revenueCatAndroidKey:
        process.env.EXPO_PUBLIC_RC_ANDROID_KEY ||
        extra.revenueCatAndroidKey ||
        "",
      revenueCatIosKey:
        process.env.EXPO_PUBLIC_RC_IOS_KEY || extra.revenueCatIosKey || "",
      webAdminConsoleUrl:
        process.env.EXPO_PUBLIC_WEB_ADMIN_CONSOLE_URL ||
        extra.webAdminConsoleUrl ||
        defaultWebAdminConsoleUrl,
      amazonAssociatesTag:
        process.env.EXPO_PUBLIC_AMAZON_ASSOCIATES_TAG ||
        process.env.AMAZON_AFFILIATE_TAG ||
        extra.amazonAssociatesTag ||
        "",
      eas: {
        ...(extra.eas || {}),
        projectId: defaultEasProjectId || extra.eas?.projectId || "",
        owner: defaultEasOwner || extra.eas?.owner || "",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: `https://u.expo.dev/${
        defaultEasProjectId || extra.eas?.projectId || ""
      }`,
    },
  };
};
