import { Injectable } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { RepositoryService } from './repository.service';
import { FirebaseService } from './firebase.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  //private imagenAvatar: string;

  constructor(public actionSheetController: ActionSheetController, private repo: RepositoryService, private fire: FirebaseService) {
    //this.imagenAvatar = '../../assets/images/avatar/avatar.png';
  }

  public async pickImage(source: CameraSource) {
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64, // Puede ser Base64 o DataUrl según tu necesidad
      source: source
    });

    // Devuelve la imagen en formato base64: image.base64String
    this.redimensionarImage(image.base64String!, 100, 400, 700).then((dataurl) => {
      let base64Image = 'data:image/jpeg;base64,' + dataurl;
      // this.imagenAvatar = base64Image;
      this.guardarImagenAvatar(base64Image);
    });
  }

  public async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [
        { text: 'Imagen de la galeria', handler: () => { this.pickImage(CameraSource.Photos) } },
        { text: 'Usar Camara', handler: () => { this.pickImage(CameraSource.Camera) } },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });

    await actionSheet.present();
    return actionSheet;
  }

  private redimensionarImage(img: string, quality: number = 100, MAX_WIDTH: number, MAX_HEIGHT: number) {
    return new Promise((resolve, reject) => {
      const canvas: any = document.createElement('canvas');
      const image = new Image();
      image.crossOrigin = 'Anonymous';
      image.src = img;
      image.onload = () => {
        let width = image.width;
        let height = image.height;
        if (!MAX_HEIGHT) {
          MAX_HEIGHT = image.height;
        }
        if (!MAX_WIDTH) {
          MAX_WIDTH = image.width;
        }
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas
          .toDataURL('image/png', quality)
          .replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
        resolve(dataUrl);
      };
      image.onerror = e => {
        reject(e);
      };
    });
  }

  // public getImagen(): string {
  //   return this.imagenAvatar;
  // }

  // public setImagen(imagen: string): void {
  //   this.imagenAvatar = imagen;
  // }

  private guardarImagenAvatar(avatar: string) {
    this.repo.setAvatar(avatar);
    this.fire.updateUserData(this.repo.getUsuario());
  }

}
