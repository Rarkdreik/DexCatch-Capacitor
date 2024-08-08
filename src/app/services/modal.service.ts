import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoadingService } from './loading.service';
import { ModalPokeballPage } from '../pages/modal-pokeball/modal-pokeball.page';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalController: ModalController, private loading: LoadingService) { }

  /**
   * Presenta un modal en la misma página a fullscreen
   * Contiene Listener onDidDismiss que recarga página
   */
  public async presentModal(titulo: string) {
    // Presentar modal
    const modal = await this.modalController.create({
      component: ModalPokeballPage,
      componentProps: { titulo }
    });

    // Recargar al quitar modal
    modal.onDidDismiss().then(any => {
      this.loading.presentLoading('Actualizando');
      location.reload();
    });

    return await modal.present();
  }

  /**
   * Cierra el primer modal que esté activo.
   */
  public dismiss() {
    this.modalController.dismiss();
  }

}
