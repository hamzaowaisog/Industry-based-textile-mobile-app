export default ({ config }) => ({
  ...config,
  name: 'HamzaTex',
  slug: 'hamzatex',
  version: '2.1.0',
  owner: 'hamzatex',
  icon: './assets/icon.png',
  ios: {
    bundleIdentifier: 'com.hamzatex.app',
    googleServicesFile: './GoogleService-Info.plist',
    buildNumber: '1',
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
    entitlements: {
      'aps-environment': process.env.APP_ENV === 'production' ? 'production' : 'development',
    },
  },
  android: {
    package: 'com.hamzatex.app',
    googleServicesFile: './google-services.json',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage:
        './textile-erp/project/design_handoff_hamzatex_erp/app-icons/android/res/mipmap-xxxhdpi/ic_launcher_foreground.png',
      backgroundColor: '#1A56DB',
    },
  },
  plugins: [
    'expo-secure-store',
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Quicksand-Regular.ttf',
          './assets/fonts/Quicksand-Medium.ttf',
          './assets/fonts/Quicksand-SemiBold.ttf',
          './assets/fonts/Quicksand-Bold.ttf',
        ],
      },
    ],
    '@react-native-firebase/app',
  ],
  extra: {
    apiUrl: process.env.API_URL ?? 'http://mhamza-2.local:5050',
    appEnv: process.env.APP_ENV ?? 'development',
    eas: {
      projectId: '7d080caa-5877-4ca0-b171-a75951595284',
    },
  },
});
