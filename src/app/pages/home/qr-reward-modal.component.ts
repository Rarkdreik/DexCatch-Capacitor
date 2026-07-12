import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { QrRewardItem } from 'src/app/model/Qrcode';

@Component({
  selector: 'app-qr-reward-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>REWARDS</ion-title>
        <ion-buttons slot="end">
          <ion-button aria-label="Cerrar" (click)="close()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <section class="reward-panel">
        <h2>Objetos obtenidos</h2>

        <div class="reward-list">
          <div class="reward-row" *ngFor="let reward of rewards">
            <img [src]="reward.imagen" [alt]="reward.nombre" class="reward-icon">
            <span class="reward-name">{{ reward.nombre }}</span>
            <span class="reward-amount">x{{ reward.cantidad }}</span>
          </div>
        </div>

        <p class="uses" *ngIf="remainingUses !== undefined">
          Usos restantes del QR: {{ remainingUses }}
        </p>
      </section>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
      color: #f8fafc;
      background: #050814;
    }

    ion-header {
      height: auto;
      width: 100%;
      margin: 0;
      border-bottom: 1px solid rgba(255, 224, 64, 0.18);
    }

    ion-toolbar {
      --background: #101c2a;
      --color: #ffe24a;
      --min-height: clamp(52px, 12vw, 64px);
      display: flex;
      height: auto;
      min-height: clamp(52px, 12vw, 64px);
      border-radius: 0;
      align-content: center;
    }

    ion-title {
      padding-inline: 48px;
      font-size: clamp(24px, 7vw, 34px);
      line-height: 1;
      letter-spacing: 0;
      text-align: center;
    }

    ion-buttons ion-button {
      width: 44px !important;
      min-width: 44px !important;
      height: 36px !important;
      min-height: 36px !important;
      margin-right: 8px !important;
    }

    ion-content {
      --background: #050814;
      --padding-top: clamp(16px, 5vw, 24px);
      --padding-bottom: clamp(16px, 5vw, 24px);
      --padding-start: clamp(14px, 5vw, 24px);
      --padding-end: clamp(14px, 5vw, 24px);
      min-height: calc(min(50vh, 620px) - clamp(52px, 12vw, 64px));
      max-height: calc(min(86vh, 620px) - clamp(52px, 12vw, 64px));
    }

    ion-content::part(scroll) {
      overflow-y: auto;
    }

    .reward-panel {
      display: grid;
      gap: clamp(14px, 4vw, 20px);
      min-width: 0;
    }

    h2 {
      margin: 0;
      font-size: clamp(18px, 5vw, 24px);
      line-height: 1.1;
      font-weight: 700;
      letter-spacing: 0;
    }

    .reward-list {
      display: grid;
      gap: clamp(8px, 3vw, 12px);
    }

    .reward-row {
      display: grid;
      grid-template-columns: clamp(32px, 10vw, 42px) minmax(0, 1fr) auto;
      align-items: center;
      gap: clamp(10px, 4vw, 16px);
      min-height: clamp(56px, 16vw, 72px);
      padding: clamp(8px, 3vw, 12px) clamp(10px, 4vw, 16px);
      border: 1px solid rgba(255, 255, 255, 0.17);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
    }

    .reward-icon {
      width: clamp(30px, 10vw, 40px);
      height: clamp(30px, 10vw, 40px);
      object-fit: contain;
    }

    .reward-name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: clamp(17px, 5.4vw, 24px);
      line-height: 1;
      font-weight: 700;
    }

    .reward-amount {
      font-size: clamp(17px, 5.2vw, 23px);
      line-height: 1;
      font-weight: 800;
      color: #67d6c8;
    }

    .uses {
      margin: 0;
      color: #dce5ef;
      font-size: clamp(14px, 4.4vw, 18px);
      line-height: 1.2;
    }

    @media (max-width: 340px) {
      ion-title {
        padding-inline: 42px;
      }

      .reward-row {
        gap: 8px;
        padding-inline: 10px;
      }
    }
  `]
})
export class QrRewardModalComponent {
  @Input() public rewards: QrRewardItem[] = [];
  @Input() public remainingUses?: number;

  constructor(private modalController: ModalController) { }

  public async close(): Promise<void> {
    await this.modalController.dismiss();
  }
}