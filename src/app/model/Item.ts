export type CaptureBallType = 'poke' | 'super' | 'ultra' | 'master';
export type ItemKind = 'ball' | 'heal' | 'revive' | 'evolution' | 'hold' | 'other';

export interface ItemInterface {
    name: string;
    display_name: string;
    img: string;
    cost: number;
    description: string;
    long_effect: string;
    short_effect: string;
    count: number;
    category?: string;
    kind?: ItemKind;
    hpRestore?: number;
    revive?: boolean;
    captureBallType?: CaptureBallType;
}
