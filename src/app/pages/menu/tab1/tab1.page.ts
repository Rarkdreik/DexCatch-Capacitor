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
    await this.loadService.presentInfiniteLoading('Actualizando Pokedex');
    //this.pokemons = this.repo.getPokemonsRegionActual();
    this.pokemons = await this.repo.getListaPokemonRegion(this.repo.getRegion());
    //this.generateItems();
    this.loadService.dismissLoading();
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
  capturar(numPoke: any, pokemox: number) {
    this.db.setnumero_nacional(numPoke);
    console.log(`\n\n\n
    no se que era ${pokemox}
    \n\n\n`);
    if (pokemox === 0) {
      if (this.db.getEntrenador().nivel >= 20) {
        this.db.setnumero_nacional(numPoke);
        this.route.navigateByUrl('captura-prueba');
      } else {
        alert('Necesitas llegar al nivel 20 para capturar a este pokemon');
      }
    } else if (pokemox === 1) {
      this.db.setnumero_nacional(numPoke);
      this.route.navigateByUrl('captura-prueba');
    } else if (pokemox === 2) {
      if (this.db.getEntrenador().nivel >= 10) {
        this.db.setnumero_nacional(numPoke);
        this.route.navigateByUrl('captura-prueba');
      } else {
        alert('Necesitas llegar al nivel 10 para capturar a este pokemon');
      }
    } else if (pokemox === 3) {
      if (this.db.getEntrenador().nivel >= 15) {
        this.db.setnumero_nacional(numPoke);
        this.route.navigateByUrl('captura-prueba');
      } else {
        alert('Necesitas llegar al nivel 15 para capturar a este pokemon');
      }
    }
  }

  irDescripcion(numero_nacional: string) {
    this.route.navigateByUrl(`modal2/${numero_nacional}`);
  }

}
