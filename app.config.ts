import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Veil",
  slug: "veil",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "veil",
  userInterfaceStyle: "light",
  platforms: ["ios", "android"],
  updates: {
    enabled: true,
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/531e303c-88c4-4dd4-b4d9-c75dd1abfc82",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.darshanregmi.veil",
    supportsTablet: true,
    buildNumber: "1.0.0",
    infoPlist: {
      NSCameraUsageDescription:
        "This app requires camera access to attach images to poems.",
      NSPhotoLibraryUsageDescription:
        "This app requires photo library access to attach images to poems.",
    },
  },
  android: {
    package: "com.darshanregmi.veil",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#0F0F10",
    },
  },
  web: {
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-font",
    "expo-router",
    "expo-web-browser",
    "expo-sharing",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FFFFFF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#0F0F10",
        sounds: [],
      },
    ],
  ],
  owner: "darshan_regmi",
  extra: {
    router: {},
    eas: {
      projectId: "531e303c-88c4-4dd4-b4d9-c75dd1abfc82",
    },
    notionToken: process.env.EXPO_PUBLIC_NOTION_TOKEN,
    notionDatabaseId: process.env.EXPO_PUBLIC_NOTION_DATABASE_ID,
  },
  runtimeVersion: "1.0.0",
};

export default config;
