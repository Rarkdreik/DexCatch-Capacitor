import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  constructor() { }

  /**
   * Presenta un alert con confirmación ya customizado, para ver más sobre este alert ir a la pagina web: https://sweetalert2.github.io/.
   * Devuelve un Promise.
   * @param title Titulo de la alerta. Será mostrado más grande y en negrita.
   * @param text Texto de la alerta. Será mostrado más pequeño y normal.
   * @param icon SweetAlertIcon predefinido. Puedes colocar el que prefieras de esta web: https://sweetalert2.github.io/#icons.
   * @param confirmButtonColor Color que se le dará al botón confirmar.
   * @param confirmButtonText Texto que se verá en el botón de confirmación.
   * @param cancelButtonColor Color que se le dará al botón cancelar.
   * @param cancelButtonText Texto que se verá en el botón de salida/escape.
   * 
   * Aqui se le facilita un codigo de ejemplo:
   * 
   * title: '¿Titulo?',
   * text: "Texto",
   * icon: SweetAlertIcon = 'warning',
   * confirmButtonColor: '#3085d6',
   * confirmButtonText: 'Confirmar',
   * cancelButtonColor: '#d33',
   * cancelButtonText: 'Cancelar';
   */
  async alertaCompleja(titulo: any, text: any, icon: SweetAlertIcon, confirmButtonColor: any, confirmButtonText: any, cancelButtonColor: any, cancelButtonText: any) {
    return await Swal.fire({
      title: titulo,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: confirmButtonColor,
      confirmButtonText: confirmButtonText,
      cancelButtonColor: cancelButtonColor,
      cancelButtonText: cancelButtonText
    });
  }

  /**
   * Presenta un alert simple ya customizado, para ver más sobre este alert ir a la pagina web: https://sweetalert2.github.io/.
   * @param title Titulo de la alerta. Será mostrado más grande y en negrita.
   * @param text Texto de la alerta. Será mostrado más pequeño y normal.
   * @param icon SweetAlertIcon predefinido. Puedes colocar el que prefieras de esta web: https://sweetalert2.github.io/#icons.
   * 
   * Aqui se le facilitan algunos iconos:
   * 
   * El icono verde de Éxito: 'success'.
   * El rojo de Error: 'error'.
   * El amarillo de Advertencia: 'warning'.
   * El azul claro de Información: 'info'.
   * El gris claro de Pregunta: 'question'.
   */
  async alertaSimple(title: string, text: any, icon: SweetAlertIcon): Promise<SweetAlertResult> {
    return await Swal.fire(title, text, icon);
  }

  /**
   * Presenta un alert de errores estandar con la autenticación.
   * @param error Error de los catch.
   */
  async alertas(error: any): Promise<SweetAlertResult> {
    let titulo: string = '';
    let mensaje: string = '';
    switch (error.code) {
      case 'auth/wrong-password':
        titulo = '¡Error en la contraseña!';
        mensaje = 'La contraseña introducida es invalida. Asegurate de escribirla correctamente.';
        break;
      case 'auth/user-not-found':
        titulo = '¡Error de autenticación!';
        mensaje = 'El correo introducido no está registrado.';
        break;
      case 'auth/invalid-email':
        titulo = '¡Error de correo!';
        mensaje = 'El correo introducido es invalido.';
        break;
      case 'auth/network-request-failed':
        titulo = '¡Error de red!';
        mensaje = 'No se ha podido conectar al servidor. Compruebe su conexión.';
        break;
      case 'auth/too-many-requests':
        titulo = '¡Error en el servidor!';
        mensaje = 'Se han hecho demasiadas peticiones al servidor, por favor espere unos minutos.';
        break;
      case 'auth/email-already-in-use':
        titulo = '¡Correo existente!';
        mensaje = 'El correo introducido ya existe, pruebe a iniciar sesión, o compruebe que no se ha equivocado.';
        break;
      case 'auth/weak-password':
        titulo = '¡Contraseña debil!';
        mensaje = 'La contraseña debe tener 6 caracteres o más.';
        break;
      case 'auth/user-disabled':
        titulo = '¡Cuenta deshabilitada!';
        mensaje = 'Porfavor contacta con el administrador para informarse, y hacer las preguntas necesarias.';
        break;
      case 'auth/popup-closed-by-user':
        titulo = '¡POPUP cerrado por el usuario!';
        mensaje = 'El usuario ha cerrado la ventana de sesión con google.';
        break;
      case 'auth/popup-blocked':
        titulo = '¡POPUP ha sido bloqueado!';
        mensaje = 'Habilita las ventanas emergentes en el navegador.';
        break;
      default:
        titulo = error.code;
        mensaje = error.message;
        break;
    }
    return await this.alertaSimple(titulo, mensaje, 'error');
  }
}
