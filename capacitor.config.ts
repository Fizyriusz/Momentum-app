import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.duveo.mobile',
  appName: 'Duveo',
  webDir: 'out',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
    SplashScreen: {
      backgroundColor: '#09090B',
      launchShowDuration: 1500,
      launchAutoHide: true,
    },
  },
};

export default config;
