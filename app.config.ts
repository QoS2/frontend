export default {
  name: 'QuestOfSeoul',
  slug: 'quest-of-seoul',
  scheme: 'questofseoul',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/shared/assets/icons/app_logo.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.questofseoul.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/shared/assets/icons/app_logo.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.questofseoul.app',
  },
  web: {
    favicon: './src/shared/assets/icons/app_logo.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow Quest of Seoul to use your location.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Quest of Seoul to access your camera.',
      },
    ],
    [
      '@mj-studio/react-native-naver-map',
      {
        client_id: process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID,
      },
    ],
  ],
};
