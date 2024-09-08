import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { DatabaseService } from 'src/app/services/database.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoadingService } from 'src/app/services/loading.service';
import { RepositoryService } from 'src/app/services/repository.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  pokemons: PokemonInterface[];
  region: string;

  constructor(
    private fire: FirebaseService,
    private db: DatabaseService,
    private route: Router,
    public repo: RepositoryService,
    private loadService: LoadingService,
  ) {
    this.pokemons = [];
    this.region = '';
  }

  async ngOnInit() {
    console.log("INI - tab1 - ngOnInit");
    // this.loadService.dismissLoading();
    // await this.loadService.presentInfiniteLoading('Actualizando Pokedex');
    //this.pokemons = this.repo.getPokemonsRegionActual();
    // this.pokemons = await this.repo.getListaPokemonRegion(this.repo.getRegion());
    //this.generateItems();
    // this.loadService.dismissLoading();
    console.log("FIN - tab1 - ngOnInit");
  }

  async ngAfterViewInit() {
    console.log("INI - tab1 - ngAfterViewInit");
    await this.loadService.presentInfiniteLoading('Actualizando Pokedex');
    this.pokemons = await this.repo.getListaPokemonRegion(this.repo.getRegion());
    this.loadService.dismissLoading();
    console.log("FIN - tab1 - ngAfterViewInit");
  }

  ngOnDestroy() {
    console.log("INI - tab1 - ngOnDestroy");
    console.log("FIN - tab1 - ngOnDestroy");
  }

  private generateItems() {
    // const count = this.pokemons.length + 1;
    // for (let i = 0; i < 50; i++) {
    //   this.items.push(`Item ${count + i}`);
    // }
  }

  onIonInfinite(ev: any) {
    // this.generateItems();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  doRefresh(event: any) {
    let pokes = this.repo.getPokemonsRegionActual();
    this.repo.setPokemonsRegionActual([]);
    this.pokemons = this.repo.getPokemonsRegionActual();
    setTimeout(() => {
      this.repo.setPokemonsRegionActual(pokes);
      this.pokemons = this.repo.getPokemonsRegionActual();
      event.target.complete();
    }, 3000);
  }

  /**
   * ir a la pagina de captura con el pokemon seleccionado
   * o solo mostrar la Ball detrás. Si se mantiene, lo liberas
   * al capturarlo se añade con todas sus características a la base de datos
   */
  async capturar(numPoke: any, pokemox: number) {
    // this.repo.setnum_nation(numPoke);
    const master = await this.fire.getMaster();
    const levelMaster = master.level;
  
    // Mapa de leveles requeridos para cada tipo de Pokémon
    const requisitoslevel: { [key: number]: number | undefined } = {
      0: 20,
      1: undefined, // Sin restricción de level
      2: 10,
      3: 15
    };
  
    // Obtener el level requerido para el tipo de Pokémon
    const levelRequerido = requisitoslevel[pokemox];
  
    if (levelRequerido === undefined || levelMaster >= levelRequerido) {
      this.route.navigate(['captura/' + numPoke], { replaceUrl: true });
    } else {
      alert(`Necesitas llegar al level ${levelRequerido} para capturar a este pokemon`);
    }
  }

  irDescripcion(num_nation: string) {
    this.route.navigateByUrl(`modal2/${num_nation}`);
  }

}
