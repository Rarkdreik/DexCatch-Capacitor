import { Injectable } from '@angular/core';
import { Master } from '../model/Master';
import { CaptureBallType, ItemInterface, ItemKind } from '../model/Item';
import { PokemonInterface } from '../model/Pokemon';
import { QrRewardItem } from '../model/Qrcode';

interface StarterBallSpec {
    name: string;
    displayName: string;
    count: number;
    cost: number;
    img: string;
    captureBallType: CaptureBallType;
    pokemonBall: string;
    description: string;
}

@Injectable({
    providedIn: 'root'
})
export class ItemService {
    private readonly itemApiBase = 'https://pokeapi.co/api/v2/item';

    private readonly starterBalls: StarterBallSpec[] = [
        {
            name: 'poke-ball',
            displayName: 'Poke Ball',
            count: 5,
            cost: 200,
            img: 'assets/images/item_pokemon/pokeball.png',
            captureBallType: 'poke',
            pokemonBall: 'pokeball',
            description: 'Ball basica para capturar Pokemon salvajes.',
        },
        {
            name: 'great-ball',
            displayName: 'Super Ball',
            count: 3,
            cost: 600,
            img: 'assets/images/item_pokemon/superball.png',
            captureBallType: 'super',
            pokemonBall: 'superball',
            description: 'Ball con mejor ratio de captura que una Poke Ball.',
        },
        {
            name: 'ultra-ball',
            displayName: 'Ultra Ball',
            count: 2,
            cost: 800,
            img: 'assets/images/item_pokemon/ultraball.png',
            captureBallType: 'ultra',
            pokemonBall: 'ultraball',
            description: 'Ball de alto rendimiento para capturas dificiles.',
        },
        {
            name: 'master-ball',
            displayName: 'Master Ball',
            count: 1,
            cost: 0,
            img: 'assets/images/item_pokemon/masterball.png',
            captureBallType: 'master',
            pokemonBall: 'masterball',
            description: 'Ball especial con captura garantizada.',
        },
    ];

    public async buildStarterInventory(lang = 'es'): Promise<ItemInterface[]> {
        const items = await Promise.all(
            this.starterBalls.map(spec => this.buildItemByName(spec.name, spec.count, lang))
        );

        return items.map(item => this.normalizeItem(item));
    }

    public buildStarterInventoryFallback(): ItemInterface[] {
        return this.starterBalls.map(spec => this.fallbackItem(spec.name, spec.count));
    }

    public buildQrRewardItems(): ItemInterface[] {
        return this.buildStarterInventoryFallback();
    }

    public async fetchCategoryItems(url: string, lang = 'es'): Promise<ItemInterface[]> {
        const response = await fetch(url);
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];

        return Promise.all(
            items.map((item: { url: string }) => this.buildItemByUrl(item.url, 1, lang))
        );
    }

    public ensureMasterItems(master: Master): Master {
        master.items = Array.isArray(master.items)
            ? this.mergeDuplicateItems(master.items.map(item => this.normalizeItem(item)))
            : [];

        master.items = this.mergeDuplicateItems(master.items);

        if (typeof master.money !== 'number' || Number.isNaN(master.money)) {
            master.money = 1500;
        }

        master.team = this.normalizePokemonList(master.team);
        master.capturados = this.normalizePokemonList(master.capturados);
        master.team.forEach(pokemon => this.syncPokemonHeldItem(pokemon));
        master.capturados.forEach(pokemon => this.syncPokemonHeldItem(pokemon));

        return master;
    }

    public addOrUpdateItem(items: ItemInterface[], item: Partial<ItemInterface> & { name: string }, count?: number): void {
        const normalized = this.normalizeItem({ ...item, count: count ?? item.count ?? 1 });
        const current = items.find(masterItem => this.canonicalName(masterItem.name) === normalized.name);

        if (current) {
            current.count = (Number(current.count) || 0) + normalized.count;
            Object.assign(current, { ...normalized, count: current.count });
            return;
        }

        items.push(normalized);
    }

    public getItemCount(master: Master, itemName: string): number {
        const canonicalName = this.canonicalName(itemName);
        const item = master.items.find(masterItem => this.canonicalName(masterItem.name) === canonicalName);

        return Number(item?.count) || 0;
    }

    public consumeItem(master: Master, itemName: string, amount = 1): boolean {
        const canonicalName = this.canonicalName(itemName);
        const item = master.items.find(masterItem => this.canonicalName(masterItem.name) === canonicalName);

        if (!item || (Number(item.count) || 0) < amount) {
            return false;
        }

        item.count = (Number(item.count) || 0) - amount;
        return true;
    }

    public getBallItem(master: Master, ballType: CaptureBallType): ItemInterface | null {
        const spec = this.getBallSpec(ballType);

        if (!spec) {
            return null;
        }

        return master.items.find(item => this.canonicalName(item.name) === spec.name) ?? null;
    }

    public getBallCount(master: Master, ballType: CaptureBallType): number {
        return Number(this.getBallItem(master, ballType)?.count) || 0;
    }

    public consumeBall(master: Master, ballType: CaptureBallType): boolean {
        const spec = this.getBallSpec(ballType);
        return spec ? this.consumeItem(master, spec.name, 1) : false;
    }

    public getPokemonBallName(ballType: CaptureBallType): string {
        return this.getBallSpec(ballType)?.pokemonBall ?? `${ballType}ball`;
    }

    public getFallbackBallImage(ballType: CaptureBallType): string {
        return this.getBallSpec(ballType)?.img ?? 'assets/images/item_pokemon/pokeball.png';
    }


    public toQrRewards(items: ItemInterface[]): QrRewardItem[] {
        return items.map(item => ({
            key: item.name,
            nombre: item.display_name || this.titleize(item.name),
            cantidad: Number(item.count) || 0,
            imagen: item.img,
        }));
    }

    public isUsableOnPokemon(item: ItemInterface): boolean {
        const normalized = this.normalizeItem(item);
        return normalized.kind === 'heal' || normalized.kind === 'revive' || normalized.kind === 'evolution';
    }

    public applyItemToPokemon(item: ItemInterface, pokemon: PokemonInterface): { used: boolean; message: string } {
        const normalized = this.normalizeItem(item);

        if (normalized.kind === 'revive') {
            if (pokemon.hp > 0) {
                return { used: false, message: 'Este Pokemon no esta debilitado.' };
            }

            pokemon.hp = normalized.name === 'max-revive'
                ? pokemon.hp_max
                : Math.max(1, Math.floor(pokemon.hp_max / 2));

            return { used: true, message: `${normalized.display_name} usado correctamente.` };
        }

        if (normalized.kind === 'heal') {
            if (pokemon.hp <= 0) {
                return { used: false, message: 'Este item no revive Pokemon debilitados.' };
            }

            if (pokemon.hp >= pokemon.hp_max) {
                return { used: false, message: 'Este Pokemon ya tiene todos los PS.' };
            }

            pokemon.hp = normalized.hpRestore === -1
                ? pokemon.hp_max
                : Math.min(pokemon.hp_max, pokemon.hp + (normalized.hpRestore ?? 20));

            return { used: true, message: `${normalized.display_name} usado correctamente.` };
        }

        return { used: false, message: 'Este item no se puede usar directamente.' };
    }

    public toHeldItem(item: Partial<ItemInterface> & { name: string }): ItemInterface {
        return { ...this.normalizeItem({ ...item, count: 1 }), count: 1 };
    }

    public getHeldItemFromPokemon(pokemon: PokemonInterface | null | undefined): ItemInterface | null {
        return pokemon?.heldItem?.name ? this.toHeldItem(pokemon.heldItem) : null;
    }

    public syncPokemonHeldItem(pokemon: PokemonInterface | null | undefined): void {
        if (!pokemon) {
            return;
        }

        const heldItem = this.getHeldItemFromPokemon(pokemon);

        if (heldItem) {
            this.setHeldItem(pokemon, heldItem);
            return;
        }

        this.clearHeldItem(pokemon);
    }

    public setHeldItem(pokemon: PokemonInterface | null | undefined, item: Partial<ItemInterface> & { name: string }): void {
        if (!pokemon) {
            return;
        }

        pokemon.heldItem = this.toHeldItem(item);
    }

    public clearHeldItem(pokemon: PokemonInterface | null | undefined): void {
        if (!pokemon) {
            return;
        }

        pokemon.heldItem = null;
    }

    public normalizeItem(item: Partial<ItemInterface> & { name: string }): ItemInterface {
        const name = this.canonicalName(item.name);
        const spec = this.getBallSpecByName(name);
        const displayName = item.display_name || spec?.displayName || this.titleize(name);
        const category = item.category || spec?.captureBallType && 'standard-balls' || '';
        const captureBallType = item.captureBallType || spec?.captureBallType;
        const hpRestore = item.hpRestore ?? this.getHpRestore(name);
        const revive = item.revive ?? this.isRevive(name);
        const kind = item.kind || this.classifyItem(name, category, captureBallType, hpRestore, revive);

        const normalized: ItemInterface = {
            name,
            display_name: displayName,
            img: item.img || spec?.img || this.fallbackImage(name),
            cost: Number(item.cost ?? spec?.cost ?? 0) || 0,
            description: item.description || spec?.description || '',
            long_effect: item.long_effect || item.description || spec?.description || '',
            short_effect: item.short_effect || item.description || spec?.description || '',
            count: Math.max(0, Number(item.count ?? 1) || 0),
            category,
            kind,
            revive,
        };

        if (hpRestore !== undefined) {
            normalized.hpRestore = hpRestore;
        }

        if (captureBallType !== undefined) {
            normalized.captureBallType = captureBallType;
        }

        return normalized;
    }

    private async buildItemByName(name: string, count: number, lang: string): Promise<ItemInterface> {
        return this.buildItemByUrl(`${this.itemApiBase}/${name}/`, count, lang);
    }

    private async buildItemByUrl(url: string, count: number, lang: string): Promise<ItemInterface> {
        try {
            const response = await fetch(url);
            const itemData = await response.json();
            return this.fromApiData(itemData, count, lang);
        } catch (error) {
            const name = url.split('/').filter(Boolean).pop() || '';
            return this.fallbackItem(name, count);
        }
    }

    private fromApiData(itemData: any, count: number, lang: string): ItemInterface {
        const name = this.canonicalName(itemData.name || '');
        const category = itemData.category?.name || '';
        const displayName = this.pickLocalizedText(itemData.names, lang, 'name') || this.titleize(name);
        const description = this.pickLocalizedText(itemData.flavor_text_entries, lang, 'text');
        const longEffect = this.pickLocalizedText(itemData.effect_entries, lang, 'effect');
        const shortEffect = this.pickLocalizedText(itemData.effect_entries, lang, 'short_effect');

        return this.normalizeItem({
            name,
            display_name: displayName,
            img: itemData.sprites?.default || this.fallbackImage(name),
            cost: itemData.cost,
            description,
            long_effect: longEffect,
            short_effect: shortEffect,
            count,
            category,
        });
    }

    private fallbackItem(name: string, count: number): ItemInterface {
        const canonicalName = this.canonicalName(name);
        const spec = this.getBallSpecByName(canonicalName);

        return this.normalizeItem({
            name: canonicalName,
            display_name: spec?.displayName || this.titleize(canonicalName),
            img: spec?.img || this.fallbackImage(canonicalName),
            cost: spec?.cost || 0,
            description: spec?.description || '',
            long_effect: spec?.description || '',
            short_effect: spec?.description || '',
            count,
            category: spec ? 'standard-balls' : '',
        });
    }


    private mergeDuplicateItems(items: ItemInterface[]): ItemInterface[] {
        const merged = new Map<string, ItemInterface>();

        items.forEach(item => {
            const normalized = this.normalizeItem(item);
            const current = merged.get(normalized.name);

            if (current) {
                current.count += normalized.count;
                return;
            }

            merged.set(normalized.name, { ...normalized });
        });

        return Array.from(merged.values());
    }

    private normalizePokemonList(pokemons: Array<PokemonInterface | null | undefined> | null | undefined): PokemonInterface[] {
        return Array.isArray(pokemons)
            ? pokemons.filter((pokemon): pokemon is PokemonInterface => !!pokemon)
            : [];
    }


    private pickLocalizedText(entries: any[] | undefined, lang: string, field: string): string {
        if (!Array.isArray(entries)) {
            return '';
        }

        const entry = entries.find(value => value.language?.name === lang) || entries[0];
        const text = entry?.[field];
        return typeof text === 'string' ? text.replace(/\n/g, ' ') : '';
    }

    private canonicalName(name: string): string {
        const normalized = (name || '').toLowerCase().trim();
        const aliases: Record<string, string> = {
            pokeball: 'poke-ball',
            'poke ball': 'poke-ball',
            superball: 'great-ball',
            'super-ball': 'great-ball',
            'super ball': 'great-ball',
            greatball: 'great-ball',
            ultraball: 'ultra-ball',
            'ultra ball': 'ultra-ball',
            masterball: 'master-ball',
            'master ball': 'master-ball',
        };

        return aliases[normalized] || normalized;
    }

    private getBallSpec(ballType: CaptureBallType): StarterBallSpec | undefined {
        return this.starterBalls.find(spec => spec.captureBallType === ballType);
    }

    private getBallSpecByName(name: string): StarterBallSpec | undefined {
        const canonicalName = this.canonicalName(name);
        return this.starterBalls.find(spec => spec.name === canonicalName);
    }

    private fallbackImage(name: string): string {
        const normalized = this.canonicalName(name);
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${normalized}.png`;
    }

    private classifyItem(name: string, category: string, captureBallType?: CaptureBallType, hpRestore?: number, revive?: boolean): ItemKind {
        if (captureBallType || category.includes('ball')) {
            return 'ball';
        }

        if (revive) {
            return 'revive';
        }

        if ((hpRestore ?? 0) !== 0) {
            return 'heal';
        }

        if (category.includes('evolution') || name.includes('stone')) {
            return 'evolution';
        }

        if (category.includes('held')) {
            return 'hold';
        }

        return 'other';
    }

    private getHpRestore(name: string): number | undefined {
        const hpByName: Record<string, number> = {
            potion: 20,
            'berry-juice': 20,
            'fresh-water': 30,
            'soda-pop': 50,
            'super-potion': 60,
            lemonade: 70,
            'moomoo-milk': 100,
            'hyper-potion': 120,
            'energy-powder': 60,
            'energy-root': 120,
            'max-potion': -1,
            'full-restore': -1,
        };

        return hpByName[this.canonicalName(name)];
    }

    private isRevive(name: string): boolean {
        const normalized = this.canonicalName(name);
        return normalized === 'revive' || normalized === 'max-revive';
    }


    private titleize(value: string): string {
        return value
            .split('-')
            .filter(Boolean)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }
}
