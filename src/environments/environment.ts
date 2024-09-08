// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  id_app: 'CatchDex',
  //googleWebClientId: '446704972713-s73s5csaakd726t2oqnds4ot8un57gab.apps.googleusercontent.com',
  googleWebClientId: '764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com',
  firebase: {
    apiKey: 'AIzaSyCkS2v2UUNwB1ClI9nnNGstkVBZcHpMLy8',
    authDomain: 'catchdex-2aa7e.firebaseapp.com',
    databaseURL: 'https://catchdex-2aa7e.firebaseio.com',
    projectId: 'catchdex-2aa7e',
    storageBucket: 'catchdex-2aa7e.appspot.com',
    messagingSenderId: "446704972713",
    appId: "1:446704972713:web:258110a757ef10c97c4ab8",
    measurementId: "G-9GL3RS1GVP"
  },
  sql_insert: `INSERT or IGNORE INTO `,
  sql_poke_columnas: ` VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24)`,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

/*
Antes
firebase: {
  apiKey: 'AIzaSyDQ4Dv9EOtFRmIjUA--GJ_4cdmCSfFpqJ4',
  authDomain: 'dexcatch2.firebaseapp.com',
  databaseURL: 'https://dexcatch2.firebaseio.com',
  projectId: 'dexcatch2',
  storageBucket: 'dexcatch2.appspot.com',
  messagingSenderId: '657920095759'
}

Ahora
firebase: {
  apiKey: "AIzaSyCkS2v2UUNwB1ClI9nnNGstkVBZcHpMLy8",
  authDomain: "catchdex-2aa7e.firebaseapp.com",
  databaseURL: "https://catchdex-2aa7e.firebaseio.com",
  projectId: "catchdex-2aa7e",
  storageBucket: "catchdex-2aa7e.appspot.com",
  messagingSenderId: "446704972713",
  appId: "1:446704972713:web:258110a757ef10c97c4ab8",
  measurementId: "G-9GL3RS1GVP"
};

*/
