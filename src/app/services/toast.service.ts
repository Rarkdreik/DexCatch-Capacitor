import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(public toastController: ToastController) { }

  /**
   * Crea y Presenta un Toast.
   * Devuelve un Promise<void>.
   * @param msg Mensaje que aparece.
   * @param col Estilo css que le da color.
   * @param dur Duracion en milisegundos. En caso vacio su valor por defecto es 2 segundos.
   * @param cerrable Muestra una X para cerrarlo manualmente.
   */
  public async presentarToast(msg: string, col: string, dur: number = 2000, cerrable: boolean = false): Promise<void> {
    const toast = await this.toastController.create({
      message: msg,
      duration: dur,
      color: col,
      buttons: cerrable ? [{ text: 'X', role: 'cancel' }] : undefined
    });
    return toast.present();
  }

  /**
   * Cierra el primer toast que haya en ese momento.
   */
  public async cerrarToast() {
    return this.toastController.dismiss();
  }

}
