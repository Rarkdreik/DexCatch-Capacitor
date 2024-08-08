import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { NativeAudio } from '@capacitor-community/native-audio'

interface Sound {
  key: string;
  asset: string;
  isNative: Boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private sounds: Sound[] = [];
  private audioPlayer: HTMLAudioElement = new Audio();
  private forceWebAudio: Boolean = true;

  constructor(private platform: Platform, private nativeAudio: NativeAudio) { }

  /**
   * Carga en memoria un audio dandole un nombre que la identifica y la ruta del archivo deseado.
   * 
   * @param key Nombre identificador del sonido indicado en asset.
   * @param asset Ruta del archivo de sonido/audio.
   */
  public preload(key: string, asset: string): void {

    if (this.platform.is('capacitor') && !this.forceWebAudio) {
      this.nativeAudio.preload({ assetId: key, assetPath: asset, audioChannelNum: 1, isUrl: false })
        .then(() => this.sounds.push({ key: key, asset: asset, isNative: true }))
        .catch(err => console.error(`Error preloading native audio: ${err}`));
    }
    else {
      this.sounds.push({ key: key, asset: asset, isNative: false });
    }

  }

  /**
   * Reproduce un audio indicado que previamente ha sido cargado.
   * 
   * @param key Nombre identificador del sonido.
   */
  public play(key: string): void {
    const soundToPlay = this.sounds.find((sound) => { return sound.key === key; });

    if (soundToPlay?.isNative) {
      this.nativeAudio.play({assetId: soundToPlay.asset})
        .then(res => console.log(`Playing native audio: ${res}`))
        .catch(err => console.error(`Error playing native audio: ${err}`));
    } else if (soundToPlay) {
      this.audioPlayer.src = soundToPlay.asset;
      this.audioPlayer.play();
    } else {
      console.warn(`Sound with key ${key} not found`);
    }
  }

  /**
   * Carga en memoria todos los audios necesarios para su rapida utilización.
   */
  public async cargarAudios() {
    const audios = [
      { key: 'audioCrecePokeball', asset: '../../assets/audio/creciendo.mp3' },
      { key: 'audioAtrapando', asset: '../../assets/audio/capturando.mp3' },
      { key: 'audioSacudidaPokeball', asset: '../../assets/audio/sacudida.mp3' },
      { key: 'audioCapturado', asset: '../../assets/audio/capturado.mp3' },
      { key: 'audioEscapado', asset: '../../assets/audio/escapandose.mp3' },
      { key: 'audioEncogePokeball', asset: '../../assets/audio/regresa.mp3' },
      { key: 'audioRegresa', asset: '../../assets/audio/regresa.mp3' }
    ];

    audios.forEach(audio => this.preload(audio.key, audio.asset));
  }

  /**
   * Detiene el audio indicado que se está reproduciendo.
   * 
   * @param audio El nombre asignado a un sonido.
   */
  public stopAudio(audio: string): void {
    const soundToStop = this.sounds.find(sound => sound.key === audio);

    if (soundToStop?.isNative) {
      this.nativeAudio.stop({ assetId: audio })
        .then(res => console.log(`Stopped native audio: ${res}`))
        .catch(err => console.error(`Error stopping native audio: ${err}`));
    }
    else if (this.audioPlayer.src === soundToStop?.asset) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      console.log(`Stopped web audio: ${audio}`);
    }
    else {
      console.warn(`Sound with key ${audio} not found or not currently playing`);
    }
  }

  /**
   * Elimina o quita un audio cargado en memoria.
   * 
   * @param audio El nombre asignado a un sonido.
   */
  public quitarAudio(audio: string): void {
    const soundIndex = this.sounds.findIndex(sound => sound.key === audio);

    if (soundIndex !== -1) {
      const soundToRemove = this.sounds[soundIndex];

      if (soundToRemove.isNative) {
        this.nativeAudio.unload({ assetId: audio })
          .then(res => console.log(`Unloaded native audio: ${res}`))
          .catch(err => console.error(`Error unloading native audio: ${err}`));
      }

      if (this.audioPlayer.src === soundToRemove.asset) {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
        this.audioPlayer.src = '';
        console.log(`Unloaded web audio: ${audio}`);
      }

      this.sounds.splice(soundIndex, 1);
    } else {
      console.warn(`Sound with key ${audio} not found`);
    }
  }

}
