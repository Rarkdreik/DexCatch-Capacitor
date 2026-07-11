import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ViewWillEnter } from '@ionic/angular';
import { ViewerModalComponent } from 'src/app/component/viewermodal/viewermodal.component';
import { Master } from 'src/app/model/Master';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { QrcodeInterface } from 'src/app/model/Qrcode';
import { AlertsService } from 'src/app/services/alerta.service';
import { ConstantService } from 'src/app/services/constant.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ImageService } from 'src/app/services/image.service';
import { LoadingService } from 'src/app/services/loading.service';
import { QRScanGenService } from 'src/app/services/qrscan-gen.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { ModalQrComponent } from './modal_qr.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, ViewWillEnter {
  public master: Master = this.constants.master_empty;
  public team_poke: any[] = this.constants.pokes_empty;
  public map_poke: string = 'kanto';
  public avatarSrc: string = 'assets/images/avatar/avatar.png';

  public qrData: string = 'qwerty qwerty qwerty';

  constructor(
    private router: Router,
    public repo: RepositoryService,
    public imagen: ImageService,
    private qr: QRScanGenService,
    private loading: LoadingService,
    private alerta: AlertsService,
    private fire: FirebaseService,
    private constants: ConstantService,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) { }

  async ionViewWillEnter() {
    console.log('INI - home - ionViewWillEnter');
    this.master = this.repo.getMaster();
    this.team_poke = this.master.team;
    await this.cargarAvatar();

    while (this.team_poke.length < 6) {
      this.team_poke.push(null);
    }

    console.log('FIN - home - ionViewWillEnter');
  }

  public async ngOnInit() {
    console.log('INI - home - ngOnInit');
    this.master = this.repo.getMaster();
    this.team_poke = this.master.team;
    await this.cargarAvatar();
    this.map_poke = this.master.region_ini;
    this.repo.setRegion(this.master.region_ini);
    this.qrData = this.master.nick;
    const codigoQr: QrcodeInterface = { correo: this.repo.getCorreo()!, codigo: this.qrData, usos: 5 };
    await this.fire.crearQr(codigoQr);

    while (this.team_poke.length < 6) {
      this.team_poke.push(null);
    }

    console.log('FIN - home - ngOnInit');
  }

  async ngAfterViewInit() {
    console.log('INI - home - ngAfterViewInit');
    console.log('FIN - home - ngAfterViewInit');
  }

  ngOnDestroy() {
    console.log('INI - home - ngOnDestroy');
    console.log('FIN - home - ngOnDestroy');
  }

  public async galeria() {
    const avatarUrl = await this.imagen.selectImage();

    if (avatarUrl) {
      this.avatarSrc = avatarUrl;
      this.cdr.detectChanges();
    }
  }

  public goMain() {
    setTimeout(() => { this.router.navigate(['/login'], { replaceUrl: true }); }, 900);
  }

  public goPokedex() {
    setTimeout(() => { this.router.navigateByUrl('/pokedex'); }, 900);
  }

  public goPokeCenter() {
    setTimeout(() => { this.router.navigateByUrl('/poke-center'); }, 900);
  }

  public goTeam() {
    setTimeout(() => { this.router.navigateByUrl('/team'); }, 900);
  }

  public async leerQr() {
    console.log('INI - home.page - leerQr');
    this.loading.presentLoading('Cargando Lector Qr');
    await this.qr.startScan().finally(() => { this.loading.dismissLoading(); });
    console.log('FIN - home.page - leerQr');
  }

  public segmentChanged(event: any) {
    this.map_poke = event.detail.value;
    this.repo.setRegion(this.map_poke);
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: ModalQrComponent
    });
    return await modal.present();
  }

  calculateHpPercentage(pokemon: PokemonInterface): number {
    return (pokemon.hp / pokemon.hp_max) * 100;
  }

  async openViewer(anyy: any, type: string) {
    const modal = await this.modalController.create({
      component: ViewerModalComponent,
      componentProps: {
        src: this.avatarSrc || this.getAvatarSrc(),
        type: type,
        some: anyy
      },
      cssClass: 'img-viewer',
      keyboardClose: true,
      showBackdrop: true
    });

    return await modal.present();
  }

  private async cargarAvatar(): Promise<void> {
    const avatarRepo = this.repo.getAvatar();

    if (avatarRepo) {
      this.avatarSrc = avatarRepo;
      return;
    }

    const avatarLocal = await this.imagen.getLocalAvatarDataUrl();
    this.avatarSrc = avatarLocal || this.getAvatarSrc();
    this.cdr.detectChanges();
  }
  private getAvatarSrc(): string {
    return this.repo.getAvatar() || 'assets/images/avatar/avatar.png';
  }

}
