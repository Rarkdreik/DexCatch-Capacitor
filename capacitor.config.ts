import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rarkdreik.catchdex',
  appName: 'DexCatch',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    "GoogleAuth": {
      "scopes": [ "profile", "email" ],
      "serverClientId": "446704972713-s73s5csaakd726t2oqnds4ot8un57gab.apps.googleusercontent.com",
      "forceCodeForRefreshToken": true
    },
    "BarcodeScanner": {
      // Opcional: configura opciones del plugin si es necesario
    },
  }
};

export default config;
