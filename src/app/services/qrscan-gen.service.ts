import { Injectable, NgZone } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Barcode, BarcodeFormat, BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { ToastService } from './toast.service';

type WebDetectedBarcode = {
  rawValue?: string;
  displayValue?: string;
};

type WebBarcodeDetector = {
  detect(source: CanvasImageSource): Promise<WebDetectedBarcode[]>;
};

type WebBarcodeDetectorConstructor = new (options?: { formats?: string[] }) => WebBarcodeDetector;

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
    formats: new UntypedFormControl([BarcodeFormat.QrCode]),
    lensFacing: new UntypedFormControl(LensFacing.Back),
    googleBarcodeScannerModuleInstallState: new UntypedFormControl(0),
    googleBarcodeScannerModuleInstallProgress: new UntypedFormControl(0),
  });

  constructor(private toast: ToastService, private readonly ngZone: NgZone) { }

  public async ngOnInit(): Promise<void> {
    if (this.isWebPlatform()) {
      this.isSupported = this.isWebScannerSupported();
      this.isPermissionGranted = false;
      return;
    }

    try {
      const support = await BarcodeScanner.isSupported();
      this.isSupported = support.supported;

      const permission = await BarcodeScanner.checkPermissions();
      this.isPermissionGranted = permission.camera === 'granted';

      await BarcodeScanner.removeAllListeners();
      await BarcodeScanner.addListener('googleBarcodeScannerModuleInstallProgress', (event) => {
        this.ngZone.run(() => {
          const { state, progress } = event;
          this.formGroup.patchValue({
            googleBarcodeScannerModuleInstallState: state,
            googleBarcodeScannerModuleInstallProgress: progress,
          });
        });
      });
    } catch (error) {
      this.isSupported = false;
      this.isPermissionGranted = false;
      console.warn('QR scanner initialization failed:', error);
    }
  }

  public async startScan(): Promise<string> {
    console.log('INI - QrScanGen.service - startScan');

    if (this.isWebPlatform()) {
      const result = await this.scanInBrowser();
      console.log('FIN - QrScanGen.service - startScan');
      return result;
    }

    if (!(await this.ensureNativeScannerAvailable())) {
      console.log('FIN - QrScanGen.service - startScan');
      return '';
    }

    try {
      await this.ensureGoogleBarcodeScannerModule();

      const hasPermission = await this.ensureCameraPermission();
      if (!hasPermission) {
        console.log('FIN - QrScanGen.service - startScan');
        return '';
      }

      const result = await this.getNativeScanResult();
      console.log('QR scan raw result', result);
      console.log('FIN - QrScanGen.service - startScan');
      return result;
    } catch (error) {
      console.error('Error during QR scan:', error);
      await this.toast.presentarToast('No se ha podido leer el codigo QR.', 'warning', 5000, true);
      console.log('FIN - QrScanGen.service - startScan');
      return '';
    } finally {
      await this.stopScan();
    }
  }

  public async scan(): Promise<string> {
    console.log('INI - QrScanGen.service - scan');
    const result = await this.startScan();
    console.log('FIN - QrScanGen.service - scan');
    return result;
  }

  public async readBarcodeFromImage(): Promise<void> {
    console.log('INI - QrScanGen.service - readBarcodeFromImage');

    if (this.isWebPlatform()) {
      await this.toast.presentarToast('La lectura de QR desde imagen solo esta disponible en Android/iOS.', 'warning', 5000, true);
      console.log('FIN - QrScanGen.service - readBarcodeFromImage');
      return;
    }

    if (!(await this.ensureNativeScannerAvailable())) {
      console.log('FIN - QrScanGen.service - readBarcodeFromImage');
      return;
    }

    try {
      const { files } = await FilePicker.pickImages({ limit: 1 });
      const path = files[0]?.path;

      if (!path) {
        console.log('FIN - QrScanGen.service - readBarcodeFromImage');
        return;
      }

      const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
        path,
        formats: this.getSelectedFormats(),
      });
      this.barcodes = barcodes;
    } catch (error) {
      console.error('Error reading QR image:', error);
      await this.toast.presentarToast('No se ha podido leer la imagen QR.', 'warning', 5000, true);
    }

    console.log('FIN - QrScanGen.service - readBarcodeFromImage');
  }

  public async openSettings(): Promise<void> {
    if (this.isWebPlatform()) {
      return;
    }

    await BarcodeScanner.openSettings();
  }

  public async installGoogleBarcodeScannerModule(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    await BarcodeScanner.installGoogleBarcodeScannerModule();
  }

  public async requestPermissions(): Promise<void> {
    if (this.isWebPlatform()) {
      return;
    }

    const permission = await BarcodeScanner.requestPermissions();
    this.isPermissionGranted = permission.camera === 'granted';
  }

  public async hideCamera(): Promise<void> {
    await this.stopScan();
  }

  public async stopScan(): Promise<void> {
    if (this.isWebPlatform()) {
      return;
    }

    try {
      await BarcodeScanner.stopScan();
    } catch (error) {
      console.warn('QR scanner stop ignored:', error);
    }
  }

  private async getNativeScanResult(): Promise<string> {
    console.log('INI - QrScanGen.service - getNativeScanResult');

    const scanResult = await BarcodeScanner.scan({ formats: this.getSelectedFormats() });
    this.barcodes = scanResult.barcodes;

    const barcode = scanResult.barcodes[0];
    const result = barcode?.rawValue || barcode?.displayValue || '';

    if (!result) {
      console.warn('No barcodes found');
    }

    console.log('FIN - QrScanGen.service - getNativeScanResult');
    return result;
  }

  private async scanInBrowser(): Promise<string> {
    const detectorConstructor = this.getWebBarcodeDetector();

    if (!detectorConstructor || !navigator.mediaDevices?.getUserMedia) {
      await this.showWebScannerUnavailableToast();
      return '';
    }

    let stream: MediaStream | undefined;
    let overlay: HTMLDivElement | undefined;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });

      const detector = new detectorConstructor({ formats: ['qr_code'] });
      const webScanner = this.createWebScannerOverlay();
      overlay = webScanner.container;
      webScanner.video.srcObject = stream;
      webScanner.statusLabel.textContent = 'Iniciando camara...';
      document.body.appendChild(overlay);

      await this.waitForVideoReady(webScanner.video, 8000);
      await webScanner.video.play();
      webScanner.statusLabel.textContent = 'Apunta la camara al QR';

      const result = await new Promise<string>((resolve) => {
        let finished = false;
        let frameId = 0;
        let frameErrorLogged = false;
        const helpTimer = window.setTimeout(() => {
          if (!finished) {
            webScanner.statusLabel.textContent = 'Si ves la pantalla negra, cierra y revisa permisos de camara.';
          }
        }, 4500);

        const finish = (value: string): void => {
          if (finished) {
            return;
          }

          finished = true;
          window.clearTimeout(helpTimer);
          cancelAnimationFrame(frameId);
          this.closeWebScanner(overlay, stream);
          resolve(value);
        };

        webScanner.closeButton.addEventListener('click', () => finish(''), { once: true });

        const scanFrame = async (): Promise<void> => {
          if (finished) {
            return;
          }

          try {
            const detectedBarcodes = await detector.detect(webScanner.video);
            const value = detectedBarcodes[0]?.rawValue || detectedBarcodes[0]?.displayValue || '';

            if (value) {
              finish(value);
              return;
            }
          } catch (error) {
            if (!frameErrorLogged) {
              frameErrorLogged = true;
              console.warn('Web QR scan frame failed:', error);
            }
          }

          frameId = requestAnimationFrame(() => { void scanFrame(); });
        };

        frameId = requestAnimationFrame(() => { void scanFrame(); });
      });

      console.log('QR scan raw result', result);
      return result;
    } catch (error) {
      console.error('Error opening browser camera:', error);
      await this.toast.presentarToast('No se ha podido abrir la camara para leer el QR.', 'warning', 5000, true);
      return '';
    } finally {
      this.closeWebScanner(overlay, stream);
    }
  }

  private createWebScannerOverlay(): { container: HTMLDivElement; video: HTMLVideoElement; closeButton: HTMLButtonElement; statusLabel: HTMLDivElement } {
    const container = document.createElement('div');
    Object.assign(container.style, {
      alignItems: 'center',
      background: '#05070a',
      display: 'flex',
      inset: '0',
      justifyContent: 'center',
      position: 'fixed',
      zIndex: '2147483647',
    });

    const video = document.createElement('video');
    video.setAttribute('playsinline', 'true');
    video.muted = true;
    Object.assign(video.style, {
      height: '100%',
      objectFit: 'cover',
      width: '100%',
    });

    const scanBox = document.createElement('div');
    Object.assign(scanBox.style, {
      border: '4px solid #ffffff',
      borderRadius: '14px',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.42)',
      height: '220px',
      left: '50%',
      pointerEvents: 'none',
      position: 'absolute',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: '220px',
    });

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = 'Cerrar';
    Object.assign(closeButton.style, {
      background: '#ffffff',
      border: '0',
      borderRadius: '6px',
      color: '#111827',
      font: '600 15px system-ui, sans-serif',
      padding: '10px 14px',
      position: 'absolute',
      right: '16px',
      top: '16px',
    });

    const statusLabel = document.createElement('div');
    Object.assign(statusLabel.style, {
      background: 'rgba(0, 0, 0, 0.62)',
      borderRadius: '6px',
      bottom: '24px',
      color: '#ffffff',
      font: '600 14px system-ui, sans-serif',
      left: '50%',
      maxWidth: '86vw',
      padding: '9px 12px',
      position: 'absolute',
      textAlign: 'center',
      transform: 'translateX(-50%)',
    });

    container.appendChild(video);
    container.appendChild(scanBox);
    container.appendChild(closeButton);
    container.appendChild(statusLabel);

    return { container, video, closeButton, statusLabel };
  }

  private waitForVideoReady(video: HTMLVideoElement, timeoutMs: number): Promise<void> {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error('La camara no ha empezado a enviar video.'));
      }, timeoutMs);

      const cleanup = (): void => {
        window.clearTimeout(timer);
        video.onloadedmetadata = null;
        video.oncanplay = null;
        video.onerror = null;
      };

      const ready = (): void => {
        cleanup();
        resolve();
      };

      video.onloadedmetadata = ready;
      video.oncanplay = ready;
      video.onerror = () => {
        cleanup();
        reject(new Error('No se ha podido cargar el video de la camara.'));
      };
    });
  }

  private closeWebScanner(overlay?: HTMLDivElement, stream?: MediaStream): void {
    stream?.getTracks().forEach((track) => track.stop());
    overlay?.remove();
  }

  private getSelectedFormats(): BarcodeFormat[] {
    const formats = this.formGroup.get('formats')?.value as BarcodeFormat[] | null;
    return formats?.length ? formats : [BarcodeFormat.QrCode];
  }

  private async ensureNativeScannerAvailable(): Promise<boolean> {
    try {
      const support = await BarcodeScanner.isSupported();
      this.isSupported = support.supported;

      if (!support.supported) {
        await this.toast.presentarToast('El lector QR no esta disponible en este dispositivo.', 'warning', 5000, true);
      }

      return support.supported;
    } catch (error) {
      this.isSupported = false;
      console.warn('QR scanner support check failed:', error);
      await this.toast.presentarToast('El lector QR no esta disponible en este dispositivo.', 'warning', 5000, true);
      return false;
    }
  }

  private async ensureGoogleBarcodeScannerModule(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    try {
      const moduleState = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();

      if (!moduleState.available) {
        await BarcodeScanner.installGoogleBarcodeScannerModule();
      }
    } catch (error) {
      console.warn('Google Barcode Scanner module check failed:', error);
    }
  }

  private async ensureCameraPermission(): Promise<boolean> {
    const currentPermission = await BarcodeScanner.checkPermissions();

    if (currentPermission.camera === 'granted') {
      this.isPermissionGranted = true;
      return true;
    }

    const requestedPermission = await BarcodeScanner.requestPermissions();
    this.isPermissionGranted = requestedPermission.camera === 'granted';

    if (!this.isPermissionGranted) {
      await this.toast.presentarToast('Permiso de camara denegado.', 'warning', 5000, true);
    }

    return this.isPermissionGranted;
  }

  private isWebPlatform(): boolean {
    return Capacitor.getPlatform() === 'web';
  }

  private isWebScannerSupported(): boolean {
    return Boolean(this.getWebBarcodeDetector() && navigator.mediaDevices?.getUserMedia);
  }

  private getWebBarcodeDetector(): WebBarcodeDetectorConstructor | undefined {
    return (window as Window & { BarcodeDetector?: WebBarcodeDetectorConstructor }).BarcodeDetector;
  }

  private async showWebScannerUnavailableToast(): Promise<void> {
    await this.toast.presentarToast('Este navegador no soporta lectura QR desde camara. Prueba Chrome o Android/iOS.', 'warning', 5000, true);
  }

}
