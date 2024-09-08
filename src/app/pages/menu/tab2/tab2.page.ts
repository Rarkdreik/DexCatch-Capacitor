import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertsService } from 'src/app/services/alerta.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ImageService } from 'src/app/services/image.service';
import { LoadingService } from 'src/app/services/loading.service';
import { QrcodeInterface } from 'src/app/model/Qrcode';
import { QRScanGenService } from 'src/app/services/qrscan-gen.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { Master } from 'src/app/model/Master';
import { ConstantService } from 'src/app/services/constant.service';
import { PokemonInterface } from 'src/app/model/Pokemon';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public master: Master = this.constants.master_empty;
  public team_poke: PokemonInterface[] = this.constants.pokes_empty;
  public map_poke: string = 'kanto';
  // Atributos para generar qr
  public qrData: string = 'qwerty qwerty qwerty';
    // public elementType: 'url' | 'canvas' | 'img';
  // Atributos para mostrar y ocultar la camara qr
    // private ionapp?: HTMLElement;
    // private boton?: HTMLElement;

  constructor( private router: Router, public repo: RepositoryService, public imagen: ImageService, private qr: QRScanGenService, private loading: LoadingService, private alerta: AlertsService, private fire: FirebaseService, private constants: ConstantService ) {
    // this.qrData = 'qwerty qwerty qwerty';
    // this.elementType = 'canvas';
  }

  public async ngOnInit() {
    console.log("INI - tab2 - ngOnInit");
    this.master = this.repo.getMaster();
    this.team_poke = this.master.team;
    this.map_poke = this.master.region_ini;
    this.repo.setRegion(this.master.region_ini);
    this.qrData = this.master.nick;
    let codigoQr: QrcodeInterface = { correo: this.repo.getCorreo()!, codigo: this.qrData, usos: 5 }
    await this.fire.crearQr(codigoQr);
    console.log("FIN - tab2 - ngOnInit");
  }

  async ngAfterViewInit() {
    console.log("INI - tab2 - ngAfterViewInit");
    console.log("FIN - tab2 - ngAfterViewInit");
  }

  ngOnDestroy() {
    console.log("INI - tab2 - ngOnDestroy");
    console.log("FIN - tab2 - ngOnDestroy");
  }

  public async galeria() {
    await this.imagen.selectImage();
  }

  public goMain() {
    this.router.navigate(['/login'], { replaceUrl: true });;
  }

  public goPokedex() {
    this.router.navigate(['/pokedex'], { replaceUrl: true });
  }

  public goTeam() {
    this.router.navigate(['/team'], { replaceUrl: true });
  }

  public async leerQr() {
    console.log("INI - tab2.page - leerQr");
    this.loading.presentLoading('Cargando Lector Qr');
    await this.qr.startScan().finally(() => { this.loading.dismissLoading(); });
    console.log("FIN - tab2.page - leerQr");
  }

  public segmentChanged(event: any) {
    this.map_poke = event.detail.value;
    this.repo.setRegion(this.map_poke);
  }

  /*
  private crearHTML() {
    this.ionapp = window.document.querySelector('app-root') as HTMLElement;
    let body = window.document.querySelector('body') as HTMLElement;
    body.insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-outline-secondary cerrarQrScanner" >Cerrar Lector Qr</button>');
    let boton = window.document.querySelector('.cerrarQrScanner') as HTMLElement;
    boton.addEventListener('click', () => { BarcodeScanner.stopScan().then(() => { this.eliminarHTML() }); }, false);
    this.boton = boton;
    this.ionapp.classList.add('has-camera');
  }

  public eliminarHTML() {
    try {
      this.boton!.remove()
      this.ionapp!.classList.remove('has-camera');
    } catch (erroneo) {
      // El boton es eliminado al escanear el codigo.
      // No se quiere mostrar al usuario el mensaje de error.
    }
  }

  public destruirQr(qr: any) {
    this.eliminarHTML();
    return qr.hideCamera().then(() => {
      qr.destruirQr();
      this.loading.dismissLoading();
    });
  }
*/

}
