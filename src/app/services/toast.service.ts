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
   * @param dur Duración en milisegundos. En caso vacío su valor por defecto es 2 segundos.
   */
  public async presentarToast(msg: string, col: string, dur: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message: msg,
      duration: dur,
      color: col
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
