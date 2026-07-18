export interface QrcodeInterface {
    codigo: string;
    correo: string;
    usos: number;
    // tiempo: number;
}

export interface QrPayloadInterface {
    type: 'dexcatch-qr';
    version: number;
    correo: string;
    codigo: string;
}

export interface QrRewardItem {
    key: string;
    nombre: string;
    cantidad: number;
    imagen: string;
}

export interface QrRedemptionResult {
    ok: boolean;
    message: string;
    rewards: QrRewardItem[];
    ownerEmail?: string;
    remainingUses?: number;
}
