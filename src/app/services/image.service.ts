import { Injectable } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { RepositoryService } from './repository.service';
import { FirebaseService } from './firebase.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ToastService } from './toast.service';
import { UserData } from '../model/UserData';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly avatarMaxWidth = 384;
  private readonly avatarMaxHeight = 384;
  private readonly avatarQuality = 0.74;
  private readonly localAvatarPath = 'avatars/avatar.jpg';

  constructor(
    public actionSheetController: ActionSheetController,
    private repo: RepositoryService,
    private fire: FirebaseService,
    private toast: ToastService
  ) { }

  public async pickImage(source: CameraSource): Promise<string> {
    const image = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: source
    });

    if (!image.dataUrl) {
      throw new Error('El plugin Camera no devolvio una imagen valida.');
    }

    const avatarDataUrl = await this.redimensionarImage(
      image.dataUrl,
      this.avatarMaxWidth,
      this.avatarMaxHeight,
      this.avatarQuality
    );

    return this.guardarImagenAvatar(avatarDataUrl);
  }

  public async selectImage(): Promise<string | null> {
    let finished = false;
    let resolveResult: (value: string | null) => void = () => undefined;
    const result = new Promise<string | null>((resolve) => {
      resolveResult = resolve;
    });

    const finish = (avatarUrl: string | null) => {
      if (!finished) {
        finished = true;
        resolveResult(avatarUrl);
      }
    };

    const chooseImage = (source: CameraSource) => {
      void this.pickImage(source)
        .then((avatarUrl) => {
          finish(avatarUrl);
        })
        .catch(async (error: unknown) => {
          console.error('No se pudo actualizar el avatar', error);

          if (!this.isCancelError(error)) {
            await this.toast.presentarToast('No se pudo actualizar el avatar.', 'danger', 3000);
          }

          finish(null);
        });
    };

    const actionSheet = await this.actionSheetController.create({
      header: 'Selecciona imagen',
      buttons: [
        { text: 'Imagen de la galeria', handler: () => { chooseImage(CameraSource.Photos); } },
        { text: 'Usar camara', handler: () => { chooseImage(CameraSource.Camera); } },
        { text: 'Cancelar', role: 'cancel', handler: () => { finish(null); } }
      ]
    });

    void actionSheet.onDidDismiss().then(({ role }) => {
      if (role === 'cancel' || role === 'backdrop') {
        finish(null);
      }
    });

    await actionSheet.present();
    return result;
  }

  public async getLocalAvatarDataUrl(): Promise<string | null> {
    try {
      const result = await Filesystem.readFile({
        path: this.localAvatarPath,
        directory: Directory.Data
      });

      const base64 = typeof result.data === 'string'
        ? result.data
        : await this.blobToBase64(result.data);

      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      return null;
    }
  }

  private redimensionarImage(img: string, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const image = new Image();

      image.onload = () => {
        let width = image.width;
        let height = image.height;

        const scale = Math.min(1, maxWidth / width, maxHeight / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('No se pudo preparar el canvas para redimensionar la imagen.'));
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      image.onerror = (error) => {
        reject(error);
      };

      image.src = img;
    });
  }

  private async guardarImagenAvatar(avatarDataUrl: string): Promise<string> {
    const usuario = this.repo.getUsuario();

    if (!usuario.uid || !usuario.email) {
      throw new Error('No hay usuario autenticado para guardar el avatar.');
    }

    await this.guardarAvatarLocal(avatarDataUrl);

    const usuarioActualizado: UserData = { ...usuario, photoURL: avatarDataUrl };
    this.repo.setUsuario(usuarioActualizado);
    await this.fire.updateUserData(usuarioActualizado);

    return avatarDataUrl;
  }

  private async guardarAvatarLocal(avatarDataUrl: string): Promise<void> {
    await Filesystem.writeFile({
      path: this.localAvatarPath,
      directory: Directory.Data,
      data: this.extraerBase64(avatarDataUrl),
      recursive: true
    });
  }

  private extraerBase64(dataUrl: string): string {
    return dataUrl.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, '');
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('No se pudo leer el avatar local.'));
          return;
        }

        resolve(this.extraerBase64(result));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  private isCancelError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /cancel|cancelled|canceled|dismiss/i.test(message);
  }

}
