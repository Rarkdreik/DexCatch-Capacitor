import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild, } from '@angular/core';
import { Barcode, BarcodeFormat, BarcodeScanner, LensFacing, StartScanOptions, } from '@capacitor-mlkit/barcode-scanning';
import { InputCustomEvent } from '@ionic/angular';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-tab2',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Scanning</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeModal()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div #square class="square"></div>
      <div class="zoom-ratio-wrapper">
        <ion-range
          [min]="minZoomRatio"
          [max]="maxZoomRatio"
          [disabled]="minZoomRatio === undefined || maxZoomRatio === undefined"
          (ionChange)="setZoomRatio($any($event))"
        ></ion-range>
      </div>
      @if (isTorchAvailable) {
      <ion-fab slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button (click)="toggleTorch()">
          <ion-icon name="flashlight"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      }
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: transparent;
      }

      .square {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 16px;
        width: 200px;
        height: 200px;
        border: 6px solid white;
        box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3);
      }

      .zoom-ratio-wrapper {
        position: absolute;
        left: 50%;
        bottom: 16px;
        transform: translateX(-50%);
        width: 50%;
      }
    `,
  ],
})
export class ModalQrComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public formats: BarcodeFormat[] = [];
  @Input()
  public lensFacing: LensFacing = LensFacing.Back;

  @ViewChild('square')
  public squareElement: ElementRef<HTMLDivElement> | undefined;

  public isTorchAvailable = false;
  public minZoomRatio: number | undefined;
  public maxZoomRatio: number | undefined;

  constructor(
    private readonly dialogService: DialogService,
    private readonly ngZone: NgZone
  ) {}

  public ngOnInit(): void {
    BarcodeScanner.isTorchAvailable().then((result) => {
      this.isTorchAvailable = result.available;
    });
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.startScan();
    }, 500);
  }

  public ngOnDestroy(): void {
    this.stopScan();
  }

  public setZoomRatio(event: InputCustomEvent): void {
    if (!event.detail.value) {
      return;
    }
    BarcodeScanner.setZoomRatio({
      zoomRatio: parseInt(event.detail.value as any, 10),
    });
  }

  public async closeModal(barcode?: Barcode): Promise<void> {
    this.dialogService.dismissModal({
      barcode: barcode,
    });
  }

  public async toggleTorch(): Promise<void> {
    await BarcodeScanner.toggleTorch();
  }

  private async startScan(): Promise<void> {
    // Hide everything behind the modal (see `src/theme/variables.scss`)
    document.querySelector('body')?.classList.add('barcode-scanning-active');

    const options: StartScanOptions = {
      formats: this.formats,
      lensFacing: this.lensFacing,
    };

    const squareElementBoundingClientRect =
      this.squareElement?.nativeElement.getBoundingClientRect();
    const scaledRect = squareElementBoundingClientRect
      ? {
          left: squareElementBoundingClientRect.left * window.devicePixelRatio,
          right:
            squareElementBoundingClientRect.right * window.devicePixelRatio,
          top: squareElementBoundingClientRect.top * window.devicePixelRatio,
          bottom:
            squareElementBoundingClientRect.bottom * window.devicePixelRatio,
          width:
            squareElementBoundingClientRect.width * window.devicePixelRatio,
          height:
            squareElementBoundingClientRect.height * window.devicePixelRatio,
        }
      : undefined;
    const detectionCornerPoints = scaledRect
      ? [
          [scaledRect.left, scaledRect.top],
          [scaledRect.left + scaledRect.width, scaledRect.top],
          [
            scaledRect.left + scaledRect.width,
            scaledRect.top + scaledRect.height,
          ],
          [scaledRect.left, scaledRect.top + scaledRect.height],
        ]
      : undefined;
    const listener = await BarcodeScanner.addListener(
      'barcodeScanned',
      async (event) => {
        this.ngZone.run(() => {
          const cornerPoints = event.barcode.cornerPoints;
          if (detectionCornerPoints && cornerPoints) {
            if (
              detectionCornerPoints[0][0] > cornerPoints[0][0] ||
              detectionCornerPoints[0][1] > cornerPoints[0][1] ||
              detectionCornerPoints[1][0] < cornerPoints[1][0] ||
              detectionCornerPoints[1][1] > cornerPoints[1][1] ||
              detectionCornerPoints[2][0] < cornerPoints[2][0] ||
              detectionCornerPoints[2][1] < cornerPoints[2][1] ||
              detectionCornerPoints[3][0] > cornerPoints[3][0] ||
              detectionCornerPoints[3][1] < cornerPoints[3][1]
            ) {
              return;
            }
          }
          listener.remove();
          this.closeModal(event.barcode);
        });
      }
    );
    await BarcodeScanner.startScan(options);
    void BarcodeScanner.getMinZoomRatio().then((result) => {
      this.minZoomRatio = result.zoomRatio;
    });
    void BarcodeScanner.getMaxZoomRatio().then((result) => {
      this.maxZoomRatio = result.zoomRatio;
    });
  }

  private async stopScan(): Promise<void> {
    // Show everything behind the modal again
    document.querySelector('body')?.classList.remove('barcode-scanning-active');

    await BarcodeScanner.stopScan();
  }
}

/*
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button defaultHref="home"></ion-back-button>
    </ion-buttons>
    <ion-title>Barcode Scanning</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-card>
    <ion-card-header>
      <ion-card-title>About</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      ⚡️ Capacitor plugin for scanning barcodes and QR codes.
    </ion-card-content>
    <ion-row class="ion-no-padding">
      <ion-col>
        <ion-button
          fill="clear"
          (click)="openOnGithub()"
          class="ion-float-right"
          >GitHub</ion-button
        >
      </ion-col>
    </ion-row>
  </ion-card>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Demo</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <form [formGroup]="formGroup">
        <ion-item>
          <ion-label position="fixed">Formats</ion-label>
          <ion-select
            multiple="true"
            placeholder="Formats"
            formControlName="formats"
          >
            <ion-select-option [value]="barcodeFormat.Aztec"
              >Aztec</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.Codabar"
              >Codabar</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.Code39"
              >Code39</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.Code93"
              >Code93</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.Code128"
              >Code128</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.DataMatrix"
              >DataMatrix</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.Ean8"
              >Ean8</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.Ean13"
              >Ean13</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.Itf"
              >Itf</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.Pdf417"
              >Pdf417</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.QrCode"
              >QrCode</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.UpcA"
              >UpcA</ion-select-option
            >
            <ion-select-option [value]="barcodeFormat.UpcE"
              >UpcE</ion-select-option
            >
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label position="fixed">Lens Facing</ion-label>
          <ion-select formControlName="lensFacing">
            <ion-select-option [value]="lensFacing.Front"
              >Front</ion-select-option
            >
            <ion-select-option [value]="lensFacing.Back"
              >Back</ion-select-option
            >
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label position="fixed"
            >Google Barcode Scanner Module Install State</ion-label
          >
          <ion-input
            formControlName="googleBarcodeScannerModuleInstallState"
            type="number"
            [readonly]="true"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="fixed"
            >Google Barcode Scanner Module Install Progress</ion-label
          >
          <ion-input
            formControlName="googleBarcodeScannerModuleInstallProgress"
            type="number"
            [readonly]="true"
          ></ion-input>
        </ion-item>
        <ion-button
          expand="block"
          (click)="startScan()"
          [disabled]="!isSupported"
          >Start Scan</ion-button
        >
        <ion-button
          expand="block"
          (click)="readBarcodeFromImage()"
          [disabled]="!isSupported"
          >Read Barcode From Image</ion-button
        >
        <ion-button expand="block" (click)="scan()" [disabled]="!isSupported"
          >Scan</ion-button
        >
        <ion-button
          expand="block"
          (click)="openSettings()"
          [disabled]="!isSupported"
          >Open Settings</ion-button
        >
        <ion-button
          expand="block"
          (click)="installGoogleBarcodeScannerModule()"
          [disabled]="!isSupported"
          >Install Google Barcode Scanner Module</ion-button
        >
        <ion-button
          expand="block"
          (click)="requestPermissions()"
          [disabled]="isPermissionGranted"
          >Request Permissions</ion-button
        >
      </form>
    </ion-card-content>
  </ion-card>
  @for (barcode of barcodes; track barcode) {
  <ion-card>
    <ion-card-content>
      <ion-item>
        <ion-label position="fixed">Bytes</ion-label>
        <ion-input
          type="text"
          readonly
          [value]="barcode.bytes?.toString() || ''"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="fixed">Corner Points</ion-label>
        <ion-input
          type="text"
          readonly
          [value]="barcode.cornerPoints?.toString() || ''"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="fixed">Display Value</ion-label>
        <ion-input
          type="text"
          readonly
          [value]="barcode.displayValue"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="fixed">Format</ion-label>
        <ion-input type="text" readonly [value]="barcode.format"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="fixed">Raw Value</ion-label>
        <ion-input type="text" readonly [value]="barcode.rawValue"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="fixed">Value Type</ion-label>
        <ion-input type="text" readonly [value]="barcode.valueType"></ion-input>
      </ion-item>
    </ion-card-content>
  </ion-card>
  }
  <qrcode [qrdata]="qrData" [width]="150" [errorCorrectionLevel]="'M'"></qrcode>
</ion-content>
*/