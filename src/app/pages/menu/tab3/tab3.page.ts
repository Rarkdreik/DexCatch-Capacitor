import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { ConstantService } from '../../../services/constant.service';
import { StatsService } from '../../../services/stats.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AnimationController, IonCard } from '@ionic/angular';
import { Master } from 'src/app/model/Master';
import { RepositoryService } from 'src/app/services/repository.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  // @ViewChild(IonCard, { read: ElementRef }) card: ElementRef<HTMLIonCardElement> | undefined;
  @ViewChildren(IonCard, { read: ElementRef }) cardElements: QueryList<ElementRef<HTMLIonCardElement>> | undefined;
  public master: Master = this.constants.master_empty;
  public poke: PokemonInterface = this.constants.poke_empty;
  public pokemonsMaster: PokemonInterface[] = [];
  public pokemons: PokemonInterface[] = [];
  public barraHP: any;
  private intervalId: any;
  private animation: any;
  private animations: Animation[] = [];

  constructor(private fire: FirebaseService, private repo: RepositoryService, private constants: ConstantService, private stats: StatsService, private animationCtrl: AnimationController) {
    this.barraHP = { width: '0%' };
    this.pokemons = this.fillArray(this.pokemons, 6);
  }

  async inicializar() {
    console.log("INI - inicializar");
    this.pokemonsMaster = await this.fire.getTeamPokemon();
    this.pokemons = this.fillArray(this.pokemonsMaster, 6);
    console.log(this.pokemons);
    console.log("FIN - inicializar");
  }

  ngOnDestroy() {
    console.log("INI - ngOnDestroy");
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log("FIN - ngOnDestroy");
  }

  async ngAfterViewInit() {
    console.log("INI - ngAfterViewInit");
    await this.inicializar();
    this.animations = [];

    this.cardElements?.forEach((element: ElementRef<HTMLIonCardElement>) => {
      let animation: any = this.animationCtrl.create().addElement(element.nativeElement).duration(1500).fromTo('transform', 'rotateY(0deg)', 'rotateY(180deg)');
      this.animations.push(animation);
    });

    for (let i = 0; i < 6; i++) {
      // const element = array[i];
      if (this.pokemons[i].numero_nacional === '') {
        this.animations[i*2].play();
      }
    }

    console.log("FIN - ngAfterViewInit");
  }

  public async heal() {
    // Abre modal y bloquea el salir de la app
    let currentWidth = 0;


    this.pokemonsMaster.forEach((element: PokemonInterface) => {
      element.hp = element.hp_max;
    });

    console.log("this.pokemonsMaster curados");
    console.log(this.pokemonsMaster);
    this.master = await this.fire.getMaster();
    this.master.team = this.pokemonsMaster;
    this.repo.setMaster(this.master);
    this.fire.updateMaster(this.master);

    this.intervalId = setInterval(async () => {
      if (currentWidth < 100) {
        currentWidth += 1; // Incrementa la anchura en 1% cada segundo
        this.barraHP = { width: `${currentWidth}%` };
      } else {
        clearInterval(this.intervalId); // Detiene el intervalo cuando llega al 100%
        // Cierra modal
      }
    }, 90); // Actualiza cada segundo
  }

  play() {
    this.animation.play();
  }

  pause() {
    this.animation.pause();
  }

  stop() {
    this.animation.stop();
  }

  // Función para rellenar el array hasta el tamaño máximo con valores ficticios
  private fillArray(array: PokemonInterface[], maxSize: number): PokemonInterface[] {
    // Define un Pokémon ficticio para rellenar
    const defaultPokemon: PokemonInterface = this.constants.poke_empty;

    // Copia el array original
    const filledArray = array.slice();

    // Añade elementos ficticios hasta alcanzar el tamaño máximo
    while (filledArray.length < maxSize) {
      filledArray.push(defaultPokemon);
    }

    return filledArray;
  }

}
