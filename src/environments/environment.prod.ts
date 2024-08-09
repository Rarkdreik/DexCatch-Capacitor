
export const environment = {
  production: false,
  id_app: 'CatchDex',
  googleWebClientId: '446704972713-s73s5csaakd726t2oqnds4ot8un57gab.apps.googleusercontent.com',
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
