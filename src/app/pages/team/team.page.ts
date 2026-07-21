import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PokeModalComponent } from 'src/app/component/poke-modal/poke-modal.component';
import { Master } from 'src/app/model/Master';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { AlertsService } from 'src/app/services/alerta.service';
import { ConstantService } from 'src/app/services/constant.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ItemService } from 'src/app/services/item.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { StatsService } from 'src/app/services/stats.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
    selector: 'app-team',
    templateUrl: './team.page.html',
    styleUrls: ['./team.page.scss'],
})
export class TeamPage implements OnInit {
    master: Master = this.constants.master_empty;
    selectedTeamIndex: number | null = null;
    selectedCapturedIndex: number | null = null;
    team: PokemonInterface[] = [];
    capturedPokemons: PokemonInterface[] = [];

    constructor(
        public router: Router,
        public repo: RepositoryService,
        private toast: ToastService,
        public stats: StatsService,
        private loading: LoadingService,
        private alerta: AlertsService,
        private fire: FirebaseService,
        private constants: ConstantService,
        private itemService: ItemService,
        private modalController: ModalController // Inyecta el controlador del modal
    ) { }

    public get teamSlots(): Array<PokemonInterface | null> {
        return this.buildPokemonSlots(this.team, 6);
    }

    public get capturedPokemonSlots(): Array<PokemonInterface | null> {
        return this.buildPokemonSlots(this.capturedPokemons, 10, 4);
    }

    ngOnInit() {
        console.log("INI - team - ngOnInit");
        this.master = this.itemService.ensureMasterItems(this.repo.getMaster());
        this.team = this.preparePokemonList(this.master.team).slice(0, 6);
        this.capturedPokemons = this.preparePokemonList(this.master.capturados);
        console.log("FIN - team - ngOnInit");
    }

    public goMain() {
        setTimeout(() => { this.router.navigate(['/home'], { replaceUrl: true }); }, 900);
    }

    selectTeamMember(index: number) {
        if (this.selectedTeamIndex === index)
            this.selectedTeamIndex = null;
        else
            this.selectedTeamIndex = index;

        this.selectedCapturedIndex = null;
    }

    selectCapturedPokemon(index: number) {
        if (this.selectedCapturedIndex === index)
            this.selectedCapturedIndex = null;
        else
            this.selectedCapturedIndex = index;

        // this.shouldPulse(this.capturedPokemons[index], index);
    }

    addOrChangePokemon() {
        if (this.selectedTeamIndex === null || this.selectedCapturedIndex === null) {
            return;
        }

        const selectedTeamPokemon = this.team[this.selectedTeamIndex] ?? null;
        const selectedCapturedPokemon = this.capturedPokemons[this.selectedCapturedIndex] ?? null;

        if (!selectedTeamPokemon && !selectedCapturedPokemon) {
            this.clearSelection();
            return;
        }

        if (this.team.length === 1 && selectedTeamPokemon && !selectedCapturedPokemon) {
            this.toast.presentarToast('No puedes cambiar el ultimo Pokemon por uno vacio', 'danger', 3000);
            return;
        }

        if (selectedCapturedPokemon) {
            if (selectedTeamPokemon && this.selectedTeamIndex < this.team.length) {
                this.team[this.selectedTeamIndex] = selectedCapturedPokemon;
            } else if (this.team.length < 6) {
                this.team.push(selectedCapturedPokemon);
            }

            this.capturedPokemons.splice(this.selectedCapturedIndex, 1);
        } else if (selectedTeamPokemon) {
            this.team.splice(this.selectedTeamIndex, 1);
        }

        if (selectedTeamPokemon) {
            const insertIndex = selectedCapturedPokemon
                ? Math.min(this.selectedCapturedIndex, this.capturedPokemons.length)
                : this.capturedPokemons.length;
            this.capturedPokemons.splice(insertIndex, 0, selectedTeamPokemon);
        }

        this.updateMaster();
        this.clearSelection();
    }

    async releasePokemon() {
        if (this.selectedTeamIndex !== null && this.selectedCapturedIndex === null) {
            if (!this.team[this.selectedTeamIndex]) {
                this.clearSelection();
                return;
            }

            if (this.team.length > 1) {
                this.team.splice(this.selectedTeamIndex, 1);
                this.updateMaster();
                this.clearSelection();
            } else {
                await this.toast.presentarToast('No puedes liberar el ultimo Pokemon del equipo', 'warning', 3000);
            }
        } else if (this.selectedCapturedIndex !== null && this.selectedTeamIndex === null) {
            if (!this.capturedPokemons[this.selectedCapturedIndex]) {
                this.clearSelection();
                return;
            }

            this.capturedPokemons.splice(this.selectedCapturedIndex, 1);
            this.updateMaster();
            this.clearSelection();
        }
    }

    assignItem() {
        this.router.navigateByUrl('/items');
    }

    async showPokemonInfo() {
        if (this.selectedCapturedIndex !== null && this.selectedTeamIndex !== null) {
            await this.toast.presentarToast('Solo puedes tener uno seleccionado', 'warning');
            return;
        }

        const selectedPoke = this.selectedCapturedIndex !== null
            ? this.capturedPokemons[this.selectedCapturedIndex] ?? null
            : this.selectedTeamIndex !== null
                ? this.team[this.selectedTeamIndex] ?? null
                : null;

        if (!selectedPoke) {
            await this.toast.presentarToast('Selecciona un Pokemon primero', 'warning');
            return;
        }

        const modal = await this.modalController.create({
            component: PokeModalComponent,
            componentProps: {
                'num_nation': selectedPoke.num_nation
            }
        });

        return await modal.present();
    }

    // shouldPulse(pokemon: any, index: number) {
    //   let pulse = false;
    // if (this.selectedTeamIndex !== null) {
    //   return this.selectedCapturedIndex === null && !this.team.includes(pokemon);
    // } else if (this.selectedCapturedIndex !== null) {
    //   return true;
    // } else {
    //   return !this.team[index];
    // }

    // if (this.selectedCapturedIndex != null)
    //   pulse = !this.capturedPokemons[this.selectedCapturedIndex];

    // console.log(`${index} -- ${pulse} -- selected=${this.selectedCapturedIndex} -- team=${this.capturedPokemons[index]} -- team=${!this.capturedPokemons[this.selectedCapturedIndex]}`);

    //   return pulse;
    // }

    loadMore(event: any) {
        // Cargar mas Pokemon capturados
        event.target.complete();
    }

    private preparePokemonList(pokemons: Array<PokemonInterface | null | undefined> | null | undefined): PokemonInterface[] {
        return Array.isArray(pokemons)
            ? pokemons
                .filter((pokemon): pokemon is PokemonInterface => !!pokemon)
                .map(pokemon => this.preparePokemon(pokemon))
            : [];
    }

    private preparePokemon(pokemon: PokemonInterface): PokemonInterface {
        this.itemService.syncPokemonHeldItem(pokemon);
        pokemon.img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${+pokemon.num_nation}.png`;
        return pokemon;
    }

    private buildPokemonSlots(pokemons: PokemonInterface[], minLength: number, multipleOf?: number): Array<PokemonInterface | null> {
        const slots: Array<PokemonInterface | null> = [...pokemons];
        const baseLength = Math.max(minLength, slots.length);
        const targetLength = multipleOf ? Math.ceil(baseLength / multipleOf) * multipleOf : baseLength;
        const emptySlots = Array.from({ length: targetLength - slots.length }, (): null => null);

        return [...slots, ...emptySlots];
    }

    private clearSelection(): void {
        this.selectedCapturedIndex = null;
        this.selectedTeamIndex = null;
    }

    private updateMaster() {
        const filteredTeam = this.team.filter((pokemon): pokemon is PokemonInterface => !!pokemon).slice(0, 6);
        const filteredCapturedPokemons = this.capturedPokemons.filter((pokemon): pokemon is PokemonInterface => !!pokemon);

        this.team = filteredTeam;
        this.capturedPokemons = filteredCapturedPokemons;
        this.master.team = filteredTeam;
        this.master.capturados = filteredCapturedPokemons;

        this.repo.setMaster(this.master);
        this.fire.updateMaster(this.master);
    }

}
