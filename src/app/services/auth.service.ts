import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { AlertsService } from './alerta.service';
import { Platform } from '@ionic/angular';
import { UserData } from '../model/UserData';
import { RepositoryService } from './repository.service';
import { FirebaseService } from './firebase.service';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Auth, signInWithCredential, UserCredential } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { ConstantService } from './constant.service';

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User, signInWithPopup } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuth: boolean = false;
  private user_empty: UserData = { uid: '', email: '', photoURL: '', displayName: '', password: '' };
  private auththy: Auth | undefined;
  private provider: any;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private alertaServicio: AlertsService,
    private platform: Platform,
    private fireServicio: FirebaseService,
    private repo: RepositoryService,
    private auth: Auth,
    private constants: ConstantService,
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    // Initialize Firebase
    const app = await initializeApp(environment.firebase);

    // Initialize Firebase Authentication and get a reference to the service
    this.auththy = await getAuth(app);
    this.auththy.languageCode = 'es';

    await this.platform.ready().then(async () => {
      await GoogleAuth.initialize();
    })

    this.provider = new GoogleAuthProvider();


    // Inicializar Firebase
    // if (!firebase.apps.length) {
    //   firebase.initializeApp(firebaseConfig);
    // }
  }

  login() {
    this.isAuth = true;
  }

  isLoggedIn(): boolean {
    return this.isAuth;
  }

  // ########################################

  /**
   * Inicia sesión de un usuario en firebase con el metodo signInWithEmailAndPassword.
   * @param userdata Los datos del usuario.
   */
  public async loginUsuario(userdata: UserData): Promise<UserData> {
    // let credential = await this.afAuth.signInWithEmailAndPassword(userdata.email, userdata.password!);

    const auth = getAuth();
    let credential = await signInWithEmailAndPassword(auth, userdata.email, userdata.password!);
      // .then((userCredential) => {
      //   // Signed in 
      //   const user = userCredential.user;
      //   // ...
      // })
      // .catch((error) => {
      //   const errorCode = error.code;
      //   const errorMessage = error.message;
      // });

    return new Promise<UserData> (async (resolve) => {
      return await this.fireServicio.getDatosUsuario(credential.user!).then((user: any) => {
        resolve(this.fireServicio.updateUserData(user));
      }).catch((erroneo) => {
        return this.alertaServicio.alertaSimple('Información invalida', 'No se ha encontrado la información de la cuenta ' + erroneo + ', intenta registrarte como un nuevo master, o contacta al soporte técnico.', 'info').then(() => {
          this.fireServicio.setDatosUsuario(credential.user)
          this.router.navigateByUrl('/iniregion');
          return this.constants.user_empty;
        });
      });
    });
  }

  /**
   * Registra un usuario en firebase con el metodo createUserDataWithEmailAndPassword.
   * @param userdata Los datos del usuario.
   */
  public async registroUsuario(userdata: UserData): Promise<UserData | User> {
    // const credential = await this.afAuth.createUserWithEmailAndPassword(userdata.email, userdata.password!);
    const auth = await getAuth();
    const credential = await createUserWithEmailAndPassword(auth, userdata.email, userdata.password!).then((userCredential) => {
        // Signed in
        // ...
        return userCredential.user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        return this.constants.user_empty;
        // ..
      });
    return new Promise((resolve) => { resolve(this.fireServicio.updateUserData(credential)) });
  }

  public isAuthenticated(): boolean {
    return this.repo.getUsuario() ? true : false;
  }

  /**
   * Almacena el usuario en local con el name 'user'
   * @param user el usuario a almacenar, en caso de omisión eliminará el usuario -> se emplea cuando cerramos sesión.
   */
  public async saveSession(userData: UserData): Promise<void> {
    try {
      if (userData as UserData) {
        this.repo.setUsuario(userData);
        this.login();

        return window.localStorage.setItem('user', this.userData_toString(userData));
      } else {
        this.repo.setUsuario(this.user_empty);

        return window.localStorage.removeItem('user');
      }
    } catch (erroneo) {
      this.alertaServicio.alertaSimple('Error', erroneo, 'error');
    }
  }

  /**
   * Almacena el usuario en local con el name 'user'
   * @param user el usuario a almacenar, en caso de omisión
   * saveSession() emilinará el usuario-> se emplea cuando cerramos
   * sesión.
   */
  public async cargarSession(): Promise<void> {
    return new Promise(async (resolve) => {
      try {
        this.saveSession(this.parseUserData(window.localStorage.getItem('user')!));
      } catch (err) {
        this.saveSession(this.user_empty);
      } finally { 
        resolve();
      }
    })
  }

  /**
   * Inicia sesión con google
   */
  public async iniciarSesionGoogle(): Promise<UserData> {
    console.log("INI - auth.service - iniciarSesionGoogle");
    let promesa: UserData;
    // const provider = new firebase.auth.GoogleAuthProvider();

    const auth = getAuth();
    const _credential = await signInWithPopup(auth, this.provider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        return await GoogleAuthProvider.credentialFromResult(result);
          // const token = credential!.accessToken;
        // The signed-in user info.
          // const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch(async (error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
          // const credential = GoogleAuthProvider.credentialFromError(error);
        return await GoogleAuthProvider.credentialFromError(error);
        // ...
      });


    if (this.platform.is('capacitor')) {
      console.log("capacitor");
      // const _credential = GoogleAuthProvider.credential((await GoogleAuth.signIn()).authentication.idToken);
      // console.log(environment.googleWebClientId);

      promesa = await signInWithCredential(this.auth, _credential!).then(async (credenciales) => {
        console.log(credenciales);
        let usuario: UserData = { uid: credenciales.user.uid, email: credenciales.user.email!, photoURL: credenciales.user.photoURL!, displayName: credenciales.user.displayName! };
        console.log(usuario);
        return await this.fireServicio.getDatosUsuario(usuario);
      });

    } else {
      console.log("browser");
      console.log(environment.googleWebClientId);
      // await GoogleAuth.initialize({'clientId': environment.googleWebClientId, scopes: ['profile', 'email'], grantOfflineAccess: true });
      // const _credential = GoogleAuthProvider.credential((await GoogleAuth.signIn()).authentication.idToken);
      // console.log(environment.googleWebClientId);

      promesa = await signInWithCredential(this.auth, _credential!).then(async (credenciales) => {
        console.log(credenciales);
        let usuario: UserData = { uid: credenciales.user.uid, email: credenciales.user.email!, photoURL: credenciales.user.photoURL!, displayName: credenciales.user.displayName! };
        console.log(usuario);
        return await this.fireServicio.getDatosUsuario(usuario);
      });
    }

    console.log("FIN - auth.service - iniciarSesionGoogle");
    return promesa;
  }

  /**
   * Registra usuario con la sesion de google
   */
  public async registrarSesionGoogle(): Promise<any> {
    // await GoogleAuth.initialize({'clientId': environment.googleWebClientId, scopes: ['profile', 'email'], grantOfflineAccess: true });
    //   try {
    //     // Realizar el inicio de sesión
    //     const credenciales = await GoogleAuth.signIn();
  
    //     // Crear el objeto UserData
    //     const usuario: UserData = { uid: credenciales.id, email: credenciales.email, photoURL: credenciales.imageUrl, displayName: credenciales.name };
  
    //     // Obtener datos del usuario desde el servicio FireService
    //     return await this.fireServicio.getDatosUsuario(usuario);
    //   } catch (error) {
    //     console.error('Error durante el inicio de sesión:', error);
    //     return null; // Retorna null en caso de error
    //   }
  }

  /**
   * Cierra la sesión
   */
  public async logout() {
    this.isAuth = false;
    this.logoutNormal();
  }

  /**
   * Cierra la sesión de google plus
   */
  private async logoutGoogle() {
    this.isAuth = false;
    return await GoogleAuth.signOut();
  }

  /**
   * Cierra la sesion guardando el usuario nulo en el repositorio, y elimina el usuario en local.
   * Con el aviso alert que nos redirige al inicio.
   */
  private async logoutNormal() {
    await this.afAuth.signOut().then(async () => {
      this.repo.setUsuario(this.user_empty);
      this.saveSession(this.user_empty);

      await this.logoutGoogle();
      this.router.navigateByUrl('/inises');

      this.alertaServicio.alertaSimple('¡Sesión Cerrada!', 'Tu sesión ha sido cerrada correctamente.', 'success').then(() => {
        this.router.navigateByUrl('/home');
      });
    }).catch((erroneo) => {
      this.alertaServicio.alertaSimple('¡Sesión no Cerrada!', 'Tu sesión no ha podido ser cerrada. ' + erroneo, 'error');
    });
  }

  /**
   * Pide confirmacion para eliminar la sesion, el usuario y todos sus datos.
   */
  public async borrarSesion() {
    return await this.alertaServicio.alertaSimple('Cerrar Sesión', 'Primero cerraremos la sesión antes de proceder a eliminar la cuenta.', 'info').then(async () => {
      let user = this.repo.getUsuario();
      this.repo.setUsuario(this.user_empty);
      this.saveSession(this.user_empty);

      await this.logoutGoogle();
      await this.router.navigateByUrl('/inises');

      await this.alertaServicio.alertaSimple('¡Sesión Cerrada!', 'Tu sesión ha sido cerrada correctamente y procederemos a eliminar la cuenta.', 'success').then(async () => {
        await this.alertaServicio.alertaCompleja('¿Borrar la cuenta y todo el progreso obtenido?', 'Se borraran todos los datos del usuario y del master. ¡Esto no podrá ser revertido!',
          'warning', '#39ff', 'Si, deseo borrar todo', '#d33', 'Cancelar').then(async (result) => {
            if (result.value) {
              this.fireServicio.deleteQr(user.email);
              this.fireServicio.deleteUser(user);
              this.fireServicio.deleteMaster(this.repo.getMaster());
              await this.afAuth.currentUser.then((data) => {
                data?.delete().then(() => {
                  this.alertaServicio.alertaSimple('¡Cuenta Eliminada!', 'Tu cuenta ha sido eliminada y todos sus datos.', 'success').then(() => {
                    this.router.navigateByUrl('/home');
                  }).catch((error) => {
                    this.alertaServicio.alertaSimple('Error al Eliminar', 'Tu cuenta no ha podido ser eliminada, comprueba la conexión.', 'error')
                  });
                });
              });
            } else {
              this.alertaServicio.alertaSimple('Cuenta indultada', 'Tu cuenta ha sido indultada.', 'info').then(() => { });
            }
          });
      });
    });
  }

  private userData_toString(userData: UserData) {
    return `UserData: { uid: ${userData.uid}, email: ${userData.email}, photoURL: ${userData.photoURL}, displayName: ${userData.displayName}, password: ${userData.password} }`;
  }

  private parseUserData(userString: string): UserData {
    try {
      return JSON.parse(userString) as UserData;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return this.user_empty;
    }
  }

}
