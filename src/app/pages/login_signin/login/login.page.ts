import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { GoogleAuth, User } from '@codetrix-studio/capacitor-google-auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertsService } from 'src/app/services/alerta.service';
import { UserData } from 'src/app/model/UserData';
import { LoggerService } from 'src/app/services/logger.service';
import { FocusService } from 'src/app/services/focus.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  private user_data: UserData = { uid: '', email: '', displayName: '', photoURL: '' }
  public loginForm: FormGroup = this.formBuilder.group({
    email: ["a@a.aa", [Validators.required, Validators.email]],
    password: ["aaaaaa", [Validators.required, Validators.minLength(6)]]
  });

  constructor(private authService: AuthService, private alertaServicio: AlertsService, private router: Router, private formBuilder: FormBuilder, private logger: LoggerService, private focus: FocusService) {}

  ngOnInit() {
    //GoogleAuth.initialize();
    this.resetFields();
    //const userCred = await signInWithPopup(auth, new GoogleAuthProvider());
  }

  login() {
    this.authService.login();
    this.router.navigate(['/home']);
  }

  async signIn() {
    const user: User = await GoogleAuth.signIn();
  }

  public irHome() {
    this.router.navigateByUrl('Home');
  }

  private resetFields() {
    this.loginForm = this.formBuilder.group({
      email: ["a@a.aa", [Validators.required, Validators.email]],
      password: ["aaaaaa", [Validators.required, Validators.minLength(6)]]
    });
  }

  public saveUserData() {
    return {
      email: this.loginForm.get('email')!.value,
      password: this.loginForm.get('password')!.value,
    };
  }

  public async onSubmit() {
    this.user_data = this.saveUserData();
    this.logger.info('LoginPage.onSubmit', 'Formulario de login enviado', { email: this.user_data.email || '(empty)' });

    await this.authService.loginUsuario(this.user_data).then(async (usuario: UserData) => {
      const nextRoute = this.authService.needsMasterSetup() ? '/iniregion' : '/home';
      this.logger.info('LoginPage.onSubmit', 'Login resuelto; guardando sesion', { email: usuario?.email || '(empty)', nextRoute });

      await this.authService.saveSession(usuario!).then(async () => {
        await this.alertaServicio.alertaSimple("Sesion Iniciada", "La sesion ha sido iniciada.", "success").then(() => {
          this.logger.info('LoginPage.onSubmit', 'Navegando tras login', { nextRoute });
          this.router.navigateByUrl(nextRoute);
        }).catch((error) => { this.alertaServicio.alertaSimple('Error login 3', error + '. Codigo error: 312189.', 'error'); });
      }).catch((erroneo) => { this.alertaServicio.alertaSimple('Error login 2', erroneo + '. Codigo error: 415563.', 'error'); });
    }).catch(error => {
      this.logger.error('LoginPage.onSubmit', 'Login fallido', error);
      this.alertaServicio.alertaSimple('Error login 1', error + '. Codigo error: 545615.', 'error');
    });
    this.resetFields();
  }

  public async loginGoogle() {
    this.focus.clearActiveElement();
    await this.authService.iniciarSesionGoogle().then(async (usuario: UserData) => {
      if (usuario.uid != '' && usuario.uid != null) {
        await this.authService.saveSession(usuario).then(async (ok) => {
          await this.alertaServicio.alertaSimple("Sesión Iniciada", "La sesión ha sido iniciada.", "success").then((ok) => {
            this.router.navigateByUrl("/iniregion");
          }).catch((error) => { this.alertaServicio.alertas(error + '2'); });
        }).catch((erroneo) => { this.alertaServicio.alertas(erroneo + '1'); });
      } else { this.alertaServicio.alertaSimple("Inicio sesión fallido", 'No se ha podido iniciar esta cuenta, pruebe a registrarse.' + usuario + '' , "warning"); }
    }).catch((erroneo) => { this.alertaServicio.alertaSimple("Error al iniciar sesion", 'No se han encontrado datos, pruebe a registrarse o contacte a un administrador. ' + erroneo + '. codigo de error: 582456' , "error"); });
  }

}
