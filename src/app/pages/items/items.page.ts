import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ViewWillEnter } from '@ionic/angular';
import { ItemsModalComponent } from 'src/app/component/items-modal/items-modal.component';
import { ItemInterface } from 'src/app/model/Item';
import { Master } from 'src/app/model/Master';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { ConstantService } from 'src/app/services/constant.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ItemService } from 'src/app/services/item.service';
import { LvupService } from 'src/app/services/lvup.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
})
export class ItemsPage implements OnInit, ViewWillEnter {
  public master: Master = this.constants.master_empty;
  public items: ItemInterface[] = [];
  public team: PokemonInterface[] = [];
  public capturedPokemons: PokemonInterface[] = [];
  public selectedItemIndex: number | null = null;
  public selectedTeamIndex: number | null = null;
  public selectedCapturedIndex: number | null = null;

  constructor(
    private router: Router,
    private repo: RepositoryService,
    private fire: FirebaseService,
    private constants: ConstantService,
    private itemService: ItemService,
    private lvup: LvupService,
    private toast: ToastService,
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
    this.loadInventory();
  }

  ionViewWillEnter(): void {
    this.loadInventory();
  }

  public get selectedItem(): ItemInterface | null {
    return this.selectedItemIndex === null ? null : this.items[this.selectedItemIndex] ?? null;
  }

  public get selectedPokemon(): PokemonInterface | null {
    if (this.selectedTeamIndex !== null) {
      return this.team[this.selectedTeamIndex] ?? null;
    }

    if (this.selectedCapturedIndex !== null) {
      return this.capturedPokemons[this.selectedCapturedIndex] ?? null;
    }

    return null;
  }

  public get teamSlots(): Array<PokemonInterface | null> {
    return this.buildPokemonSlots(this.team, 6);
  }

  public get capturedPokemonSlots(): Array<PokemonInterface | null> {
    return this.buildPokemonSlots(this.capturedPokemons, 8, 4);
  }

  public get equipActionLabel(): string {
    return !this.selectedItem && this.selectedPokemon ? 'QUITAR' : 'EQUIPAR';
  }

  public get canRunEquipAction(): boolean {
    const pokemon = this.selectedPokemon;

    if (!pokemon) {
      return false;
    }

    return this.selectedItem ? true : !!this.itemService.getHeldItemFromPokemon(pokemon);
  }

  public selectItem(index: number): void {
    this.selectedItemIndex = this.selectedItemIndex === index ? null : index;
  }

  public selectTeamPokemon(index: number): void {
    if (!this.team[index]) {
      return;
    }

    this.selectedTeamIndex = this.selectedTeamIndex === index ? null : index;
    this.selectedCapturedIndex = null;
  }

  public selectCapturedPokemon(index: number): void {
    if (!this.capturedPokemons[index]) {
      return;
    }

    this.selectedCapturedIndex = this.selectedCapturedIndex === index ? null : index;
    this.selectedTeamIndex = null;
  }

  public async showItemInfo(): Promise<void> {
    if (!this.selectedItem) {
      await this.toast.presentarToast('Selecciona un item primero.', 'warning', 2500);
      return;
    }

    const modal = await this.modalController.create({
      component: ItemsModalComponent,
      componentProps: { item: this.selectedItem },
      cssClass: 'items-info-modal',
      showBackdrop: true,
      backdropDismiss: true,
    });

    await modal.present();
  }

  public async runEquipAction(): Promise<void> {
    if (this.selectedItem) {
      await this.equipSelectedItem();
      return;
    }

    await this.removeHeldItemFromSelectedPokemon();
  }

  public async equipSelectedItem(): Promise<void> {
    const item = this.selectedItem;
    const pokemon = this.selectedPokemon;

    if (!item || !pokemon) {
      await this.toast.presentarToast('Selecciona un item y un Pokemon.', 'warning', 2500);
      return;
    }

    const itemToEquip = this.itemService.toHeldItem(item);
    const previousItem = this.itemService.getHeldItemFromPokemon(pokemon);

    if (previousItem?.name === itemToEquip.name) {
      await this.toast.presentarToast('Ese Pokemon ya lleva este item.', 'warning', 2500);
      return;
    }

    if (!this.itemService.consumeItem(this.master, itemToEquip.name, 1)) {
      await this.toast.presentarToast('No quedan unidades de este item.', 'danger', 2500);
      return;
    }

    if (previousItem) {
      this.itemService.addOrUpdateItem(this.master.items, previousItem, 1);
    }

    this.itemService.setHeldItem(pokemon, itemToEquip);
    await this.saveMaster('Item equipado correctamente.', pokemon);
  }

  public async removeHeldItemFromSelectedPokemon(): Promise<void> {
    const pokemon = this.selectedPokemon;

    if (!pokemon) {
      await this.toast.presentarToast('Selecciona un Pokemon primero.', 'warning', 2500);
      return;
    }

    const heldItem = this.itemService.getHeldItemFromPokemon(pokemon);

    if (!heldItem) {
      await this.toast.presentarToast('Ese Pokemon no lleva ningun item.', 'warning', 2500);
      return;
    }

    this.itemService.addOrUpdateItem(this.master.items, heldItem, 1);
    this.itemService.clearHeldItem(pokemon);
    await this.saveMaster('Item guardado en la mochila.', pokemon);
  }

  public async useSelectedItem(): Promise<void> {
    const item = this.selectedItem;
    const pokemon = this.selectedPokemon;

    if (!item || !pokemon) {
      await this.toast.presentarToast('Selecciona un item y un Pokemon.', 'warning', 2500);
      return;
    }

    const normalizedItem = this.itemService.normalizeItem(item);

    if (normalizedItem.kind === 'evolution') {
      await this.useEvolutionItem(normalizedItem, pokemon);
      return;
    }

    const result = this.itemService.applyItemToPokemon(normalizedItem, pokemon);

    if (!result.used) {
      await this.toast.presentarToast(result.message, 'warning', 3000);
      return;
    }

    if (!this.itemService.consumeItem(this.master, normalizedItem.name, 1)) {
      await this.toast.presentarToast('No quedan unidades de este item.', 'danger', 2500);
      return;
    }

    await this.saveMaster(result.message, pokemon);
  }

  public canUseSelectedItem(): boolean {
    return !!this.selectedItem && this.itemService.isUsableOnPokemon(this.selectedItem);
  }

  private async useEvolutionItem(item: ItemInterface, pokemon: PokemonInterface): Promise<void> {
    if (this.itemService.getItemCount(this.master, item.name) <= 0) {
      await this.toast.presentarToast('No quedan unidades de este item.', 'danger', 2500);
      return;
    }

    const result = await this.lvup.useEvolutionItem(pokemon, item);

    if (!result.evolved) {
      await this.toast.presentarToast(result.message, 'warning', 3500);
      return;
    }

    if (!this.itemService.consumeItem(this.master, item.name, 1)) {
      await this.toast.presentarToast('No quedan unidades de este item.', 'danger', 2500);
      return;
    }

    await this.saveMaster(result.message, result.pokemon);
  }

  public goMain(): void {
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  public getPokemonImage(pokemon: PokemonInterface): string {
    return pokemon.img || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${+pokemon.num_nation}.png`;
  }

  private loadInventory(): void {
    this.master = this.itemService.ensureMasterItems(this.repo.getMaster());
    this.items = this.master.items.filter(item => (Number(item.count) || 0) > 0);
    this.team = this.preparePokemonList(this.master.team).slice(0, 6);
    this.capturedPokemons = this.preparePokemonList(this.master.capturados);
  }

  private preparePokemonList(pokemons: Array<PokemonInterface | null | undefined> | null | undefined): PokemonInterface[] {
    return Array.isArray(pokemons)
      ? pokemons
        .filter((pokemon): pokemon is PokemonInterface => !!pokemon)
        .map(pokemon => this.preparePokemon(pokemon))
      : [];
  }

  private buildPokemonSlots(pokemons: PokemonInterface[], minLength: number, multipleOf?: number): Array<PokemonInterface | null> {
    const slots: Array<PokemonInterface | null> = [...pokemons];
    const baseLength = Math.max(minLength, slots.length);
    const targetLength = multipleOf ? Math.ceil(baseLength / multipleOf) * multipleOf : baseLength;
    const emptySlots = Array.from({ length: targetLength - slots.length }, (): null => null);

    return [...slots, ...emptySlots];
  }

  private preparePokemon(pokemon: PokemonInterface): PokemonInterface {
    this.itemService.syncPokemonHeldItem(pokemon);
    pokemon.img = this.getPokemonImage(pokemon);
    return pokemon;
  }

  private async saveMaster(message: string, changedPokemon?: PokemonInterface): Promise<void> {
    console.log('save masete');
    this.master.items = this.master.items.filter(item => (Number(item.count) || 0) > 0);
    this.master.team = this.team.filter((pokemon): pokemon is PokemonInterface => !!pokemon).slice(0, 6);
    this.master.capturados = this.capturedPokemons.filter((pokemon): pokemon is PokemonInterface => !!pokemon);
    console.log('this.master:', this.master);

    this.repo.setMaster(this.master);
    await this.fire.updateMaster(this.master);

    if (changedPokemon) {
      console.log('changedPokemon:', changedPokemon);
      await this.fire.addPokemon(changedPokemon);
    }

    this.loadInventory();
    await this.toast.presentarToast(message, 'success', 2500);
  }
}
