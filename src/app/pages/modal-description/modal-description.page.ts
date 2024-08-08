import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { StatsService } from 'src/app/services/stats.service';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { ConstantService } from 'src/app/services/constant.service';
import { RepositoryService } from 'src/app/services/repository.service';

@Component({
  selector: 'app-modal-description',
  templateUrl: './modal-description.page.html',
  styleUrls: ['./modal-description.page.scss'],
})
export class ModalDescriptionPage implements OnInit {
  ocultar1: string = 'show'; ocultar2: string = 'hide';
  // Lo usamos para mostrar un cargando mientras se realiza la operación.
  myloading: any; numero_nacional: string = '001'; evolucion: string = '001';
  genero: boolean = true;
  // pokemon: PokemonInterface;
  pokemon: PokemonInterface = this.constants.poke_empty;

  constructor(
    private router: Router,
    public loadingController: LoadingController,
    private stats: StatsService,
    private route: ActivatedRoute,
    private db: DatabaseService,
    public repo: RepositoryService,
    public constants: ConstantService
  ) {
    this.numero_nacional = this.route.snapshot.paramMap.get('id')!;
    this.pokemon = this.stats.getStatsPokemon(this.numero_nacional);

    if ((Math.floor(Math.random() * (10 - 1 + 1)) + 1) <= 8) {
      this.pokemon.genero = 'hembra'; this.genero = true;
    } else {
      this.pokemon.genero = 'macho'; this.genero = false;
    }
  }

  ngOnInit() {
  }

  /**
   * Es un componente de la interfaz IONIC v4
   */
  async presentLoading() {
    this.myloading = await this.loadingController.create({ message: 'Guardando' });

    return await this.myloading.present();
  }

  /**
   * ir a la pagina de captura con el pokemon seleccionado
   * o solo mostrar la Ball detrás. Si se mantiene, lo liberas
   * al capturarlo se añade con todas sus características a la base de datos
   */
  capturar(numPoke: any, pokemox: number) {
    this.db.setnumero_nacional(numPoke);
    if (pokemox === 0) {
      if (this.db.getEntrenador().nivel >= 20) {
        this.db.setnumero_nacional(numPoke);
        this.router.navigateByUrl('captura/' + numPoke);
      } else {
        alert('Necesitas llegar al nivel 20 para capturar a este pokemon');
      }
    } else if (pokemox === 1) {
      this.db.setnumero_nacional(numPoke);
      this.router.navigateByUrl('captura/' + numPoke);
    } else if (pokemox === 2) {
      if (this.db.getEntrenador().nivel >= 10) {
        this.db.setnumero_nacional(numPoke);
        this.router.navigateByUrl('captura/' + numPoke);
      } else {
        alert('Necesitas llegar al nivel 10 para capturar a este pokemon');
      }
    } else if (pokemox === 3) {
      if (this.db.getEntrenador().nivel >= 15) {
        this.db.setnumero_nacional(numPoke);
        this.router.navigateByUrl('captura/' + numPoke);
      } else {
        alert('Necesitas llegar al nivel 15 para capturar a este pokemon');
      }
    }
  }

  mostrarInfoPokemon() {
    if (this.ocultar1 === 'show') {
      this.ocultar1 = 'hide';
      this.ocultar2 = 'show';
    } else {
      this.ocultar1 = 'show';
      this.ocultar2 = 'hide';
    }
  }

}

