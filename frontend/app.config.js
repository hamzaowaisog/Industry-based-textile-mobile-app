export default ({ config }) => ({
  ...config,
  name: 'HamzaTex',
  slug: 'hamzatex',
  version: '1.0.0',
  owner: 'hamzatex',
  ios: {
    bundleIdentifier: 'com.hamzatex.app',
    googleServicesFile: './GoogleService-Info.plist',
    buildNumber: '1',
  },
  android: {
    package: 'com.hamzatex.app',
    googleServicesFile: './google-services.json',
    versionCode: 1,
  },
  plugins: [
    'expo-secure-store',
    'expo-font',
    '@react-native-firebase/app',
  ],
  extra: {
    apiUrl: process.env.API_URL ?? 'http://localhost:5000/api',
    appEnv: process.env.APP_ENV ?? 'development',
    eas: {
      projectId: '7d080caa-5877-4ca0-b171-a75951595284',
    },
  },
});
