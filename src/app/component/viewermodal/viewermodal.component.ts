import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-viewermodal',
  templateUrl: './viewermodal.component.html',
  styleUrls: ['./viewermodal.component.scss'],
})
export class ViewerModalComponent  implements OnInit {
  src: string = '';
  data: any;
  some: any;
  type: string = 'qrcode';

  // Atributos para generar qr
  public qrData: string = 'qwerty qwerty qwerty';

  constructor(private navParams: NavParams, private modalController: ModalController) {}

  ngOnInit() {
    // Aquí obtienes las propiedades pasadas con componentProps
    this.type = this.navParams.get('type');
    this.data = this.navParams.get('src');
    this.some = this.navParams.get('some');

    console.log('Image Source:', this.src);
    console.log('type:', this.type);
    console.log('Other Parameter:', this.some);
  }

  closeModal() {  
    this.modalController.dismiss();
  }

}
