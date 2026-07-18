import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ViewWillEnter } from '@ionic/angular';
import { ViewerModalComponent } from 'src/app/component/viewermodal/viewermodal.component';
import { Master } from 'src/app/model/Master';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { QrcodeInterface, QrRedemptionResult } from 'src/app/model/Qrcode';
import { AlertsService } from 'src/app/services/alerta.service';
import { ConstantService } from 'src/app/services/constant.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ImageService } from 'src/app/services/image.service';
import { LoadingService } from 'src/app/services/loading.service';
import { QRScanGenService } from 'src/app/services/qrscan-gen.service';
import { ToastService } from 'src/app/services/toast.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { ModalQrComponent } from './modal_qr.component';
import { QrRewardModalComponent } from './qr-reward-modal.component';

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

  public qrData: string = '';

  constructor(
    private router: Router,
    public repo: RepositoryService,
    public imagen: ImageService,
    private qr: QRScanGenService,
    private loading: LoadingService,
    private toast: ToastService,
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
    const correo = this.repo.getCorreo();

    if (correo) {
      const codigoQr: QrcodeInterface = { correo, codigo: '', usos: 5 };
      const qrPublicado = await this.fire.crearQr(codigoQr);
      this.qrData = this.fire.buildQrPayload(qrPublicado);
      console.log('Home QR payload', this.qrData);
    }

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

  public goShop() {
    setTimeout(() => { this.router.navigateByUrl('/shop'); }, 900);
  }

  public goItems() {
    setTimeout(() => { this.router.navigateByUrl('/items'); }, 900);
  }

  public goPokeCenter() {
    setTimeout(() => { this.router.navigateByUrl('/poke-center'); }, 900);
  }

  public goTeam() {
    setTimeout(() => { this.router.navigateByUrl('/team'); }, 900);
  }

  public async leerQr() {
    console.log('INI - home.page - leerQr');
    //return this.presentQrResult({ ok: true, message: 'QR demo. Recompensa obtenida.', rewards: [{ key: 'pokeBalls', nombre: 'Pokeball', cantidad: 5, imagen: 'assets/images/item_pokemon/pokeball.png' }, { key: 'superBalls', nombre: 'Superball', cantidad: 3, imagen: 'assets/images/item_pokemon/superball.png' }, { key: 'ultraBalls', nombre: 'Ultraball', cantidad: 2, imagen: 'assets/images/item_pokemon/ultraball.png' }, { key: 'masterBalls', nombre: 'Masterball', cantidad: 1, imagen: 'assets/images/item_pokemon/masterball.png' }], remainingUses: 4 });

    const codigo = await this.qr.startScan();
    console.log('QR scan raw result', codigo);
    let resultado: QrRedemptionResult = { ok: false, message: 'No se ha leido ningun QR.', rewards: [] };

    if (codigo) {
      await this.loading.presentInfiniteLoading('Canjeando QR');

      try {
        resultado = await this.fire.prueba(codigo);
      } finally {
        await this.loading.dismissLoading();
      }
    }

    console.log('QR redemption result', resultado);
    await this.presentQrResult(resultado);
    console.log('FIN - home.page - leerQr');
  }

  private async presentQrResult(resultado: QrRedemptionResult): Promise<void> {
    await this.toast.presentarToast(resultado.message, resultado.ok ? 'success' : 'warning', 5000, true);

    if (!resultado.ok || resultado.rewards.length === 0) {
      return;
    }

    const modal = await this.modalController.create({
      component: QrRewardModalComponent,
      componentProps: {
        rewards: resultado.rewards,
        remainingUses: resultado.remainingUses,
      },
      cssClass: 'qr-reward-modal',
      showBackdrop: true,
      backdropDismiss: true,
    });

    await modal.present();
  }

  public segmentChanged(event: any) {
    this.map_poke = event.detail.value;
    this.repo.setRegion(this.map_poke);
  }

  async openModal() {
    const modal = await this.modalController.create({ component: ModalQrComponent });
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
        qrData: this.qrData,
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
