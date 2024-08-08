import { Injectable, NgZone } from '@angular/core';
import { Barcode, BarcodeFormat, BarcodeScanner, LensFacing, ScanResult } from '@capacitor-mlkit/barcode-scanning';
import { AlertsService } from './alerta.service';
import { ToastService } from './toast.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DialogService } from './dialog.service';
import { Tab2ModalComponent } from '../pages/menu/tab2/tab2-modal.component';
import { FilePicker } from '@capawesome/capacitor-file-picker';

@Injectable({
  providedIn: 'root'
})
export class QRScanGenService {
  public readonly barcodeFormat = BarcodeFormat;
  public readonly lensFacing = LensFacing;
  public isSupported = false;
  public isPermissionGranted = false;
  public barcodes: Barcode[] = [];
  public formGroup = new UntypedFormGroup({
    formats: new UntypedFormControl([]),
    lensFacing: new UntypedFormControl(LensFacing.Back),
    googleBarcodeScannerModuleInstallState: new UntypedFormControl(0),
    googleBarcodeScannerModuleInstallProgress: new UntypedFormControl(0),
  });

  constructor(private alertService: AlertsService, private toast: ToastService, private readonly ngZone: NgZone, private dialogService: DialogService) { }

  public async ngOnInit(): Promise<void> {
    await BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    await BarcodeScanner.checkPermissions().then((result) => {
      this.isPermissionGranted = result.camera === 'granted';
    });
    await BarcodeScanner.removeAllListeners().then(async () => {
      await BarcodeScanner.addListener('googleBarcodeScannerModuleInstallProgress', (event) => {
        this.ngZone.run(() => {
            console.log('googleBarcodeScannerModuleInstallProgress', event);
            const { state, progress } = event;
            this.formGroup.patchValue({
              googleBarcodeScannerModuleInstallState: state,
              googleBarcodeScannerModuleInstallProgress: progress,
            });
          });
        },
      );
    });
  }

/*
  public async startScan(): Promise<void> {
    console.log("INI - QrScanGen.service - startScan");
    const formats = this.formGroup.get('formats')?.value || [];
    const lensFacing = this.formGroup.get('lensFacing')?.value || LensFacing.Back;
    const element = await this.dialogService.showModal({
      component: Tab2ModalComponent,
      // Set `visibility` to `visible` to show the modal (see `src/theme/variables.scss`)
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        formats: formats,
        lensFacing: lensFacing,
      },
    });
    element.onDidDismiss().then((result) => {
      this.eliminarHTML();
      console.log('result');
      console.log(result);
      const barcode: Barcode | undefined = result.data?.barcode;
      console.log(result.data?.barcode);
      console.log('hum' + result.data?.barcode.rawValue);
      if (barcode) {
        this.barcodes = [barcode];
      }
    });
    console.log('barcodes');
    console.log(this.barcodes);
    console.log("FIN - QrScanGen.service - startScan");
  }
*/

  private async getResultScan(): Promise<string> {
    console.log("INI - QrScanGen.service - getResultScan");
    let result: string = '';
    /*
    * BarcodeFormat.Aztec,      BarcodeFormat.Codabar,  BarcodeFormat.Code128,  BarcodeFormat.Code39,
    * BarcodeFormat.DataMatrix, BarcodeFormat.Ean13,    BarcodeFormat.Ean8,     BarcodeFormat.Itf,
    * BarcodeFormat.Pdf417,     BarcodeFormat.QrCode,   BarcodeFormat.UpcA,     BarcodeFormat.UpcE
    */
    const formats: BarcodeFormat[] = [];
    result = await BarcodeScanner.scan({ formats}).then(scanResult => {

      if (scanResult.barcodes.length > 0) {
        // Devuelve el contenido del primer código de barras escaneado
        result = scanResult.barcodes[0].displayValue;
      } else {
        console.warn('No barcodes found');
        result = '';
      }

      return result;
    }).catch((error) => {
      console.error('Error during scan: ', error);
      return result;
    });

    console.log("FIN - QrScanGen.service - getResultScan");
    return result;
  }

  public async startScan(): Promise<string> {
    console.log("INI - QrScanGen.service - startScan");
    let result: string = '';

    if (!(await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()).available) {
      try {
        await BarcodeScanner.installGoogleBarcodeScannerModule();
      } catch (error) {
        this.toast.presentarToast("Ya ha sido instaldo el QrScanner", "blue");
      }
    }

    try {
      // Comprobar permiso de la cámara
      if (!this.isPermissionGranted) {
        console.log("humm");
        // Pedir permiso de la cámara
        const permission = await BarcodeScanner.requestPermissions();

        if (!permission.camera) {
          // poner Alert
          console.error('Camera permission not granted');
          result = '';
        } else {
          result = await this.getResultScan();
        }

      } else {
        result = await this.getResultScan();
      }
    } catch (error) {
      console.error('Error during scan: - hum -', error);
      result = '';
    }

    this.stopScan();
    console.log('result=' + result)
    console.log("FIN - QrScanGen.service - startScan");
    return result;
  }

  public async scan(): Promise<string> {
    console.log("INI - QrScanGen.service - scan");
    const formats: BarcodeFormat[] = [];
    const { barcodes } = await BarcodeScanner.scan({ formats });
    this.barcodes = barcodes;
    console.log(barcodes[0].rawValue);
    console.log("INI - QrScanGen.service - scan");
    return barcodes[0].rawValue;
  }

  public async readBarcodeFromImage(): Promise<void> {
    console.log("INI - QrScanGen.service - readBarcodeFromImage");
    const { files } = await FilePicker.pickImages({ limit: 1 });
    const path = files[0]?.path;

    if (!path) { return; }

    const formats = this.formGroup.get('formats')?.value || [];
    const { barcodes } = await BarcodeScanner.readBarcodesFromImage({ path, formats, });
    this.barcodes = barcodes;
    console.log("FIN - QrScanGen.service - readBarcodeFromImage");
  }

  public async openSettings(): Promise<void> {
    await BarcodeScanner.openSettings();
  }

  public async installGoogleBarcodeScannerModule(): Promise<void> {
    await BarcodeScanner.installGoogleBarcodeScannerModule();
  }

  public async requestPermissions(): Promise<void> {
    await BarcodeScanner.requestPermissions();
  }

  hideCamera() {
    return BarcodeScanner.stopScan();
  }

  stopScan() {
    BarcodeScanner.stopScan();
  }

}
