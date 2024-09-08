import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationController, IonCard, IonImg } from '@ionic/angular';
import { Master } from 'src/app/model/Master';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { ConstantService } from 'src/app/services/constant.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { StatsService } from 'src/app/services/stats.service';

@Component({
  selector: 'app-poke-center',
  templateUrl: './poke-center.page.html',
  styleUrls: ['./poke-center.page.scss'],
})
export class PokeCenterPage implements OnInit {
  // @ViewChild(IonCard, { read: ElementRef }) card: ElementRef<HTMLIonCardElement> | undefined;
  @ViewChildren(IonCard, { read: ElementRef }) cardElements: QueryList<ElementRef<HTMLIonCardElement>> | undefined;
  @ViewChild(IonImg, { read: ElementRef }) ion_img: ElementRef<HTMLIonImgElement> | undefined;
  public master: Master = this.constants.master_empty;
  public poke: PokemonInterface = this.constants.poke_empty;
  public pokemonsMaster: PokemonInterface[] = [];
  public pokemons: PokemonInterface[] = [];
  public barraHP: any;
  private intervalId: any;
  private animation: any;
  private animation_heal: any;
  private animations: Animation[] = [];

  constructor(private fire: FirebaseService, private repo: RepositoryService, private constants: ConstantService, private stats: StatsService, private animationCtrl: AnimationController, private router: Router) {
    this.barraHP = { width: '0%' };
    this.pokemons = this.fillArray(this.pokemons, 6);
  }

  async inicializar() {
    console.log("INI - poke-center - inicializar");
    this.pokemonsMaster = await this.fire.getTeamPokemon();
    this.pokemons = this.fillArray(this.pokemonsMaster, 6);
    console.log("FIN - poke-center - inicializar");
  }

  ngOnInit() {
  }

  async ngAfterViewInit() {
    console.log("INI - poke-center - ngAfterViewInit");
    await this.inicializar();
    this.animations = [];

    this.cardElements?.forEach((element: ElementRef<HTMLIonCardElement>) => {
      let animation: any = this.animationCtrl.create().addElement(element.nativeElement).fromTo('transform', 'rotateY(0deg)', 'rotateY(180deg)');
      this.animations.push(animation);
    });
    
    this.animation_heal = this.animationCtrl.create().addElement(this.ion_img!.nativeElement).duration(1000).iterations(Infinity)
    .keyframes([
      { offset: 0, transform: 'rotate(0deg) rotateY(0deg)' },
      { offset: 0.25, transform: 'rotate(15deg) ' },
      { offset: 0.5, transform: 'rotate(0deg) rotateY(180deg)' },
      { offset: 0.75, transform: 'rotate(-15deg) ' },
      { offset: 1, transform: 'rotate(0deg) rotateY(0deg)' },
    ]);

    for (let i = 0; i < 6; i++) {
      if (this.pokemons[i]?.num_nation === '') {
        this.animations[i*2].play();
      }
    }

    console.log("FIN - poke-center - ngAfterViewInit");
  }

  ngOnDestroy() {
    console.log("INI - poke-center - ngOnDestroy");

    if (this.intervalId)
      clearInterval(this.intervalId);

    console.log("FIN - poke-center - ngOnDestroy");
  }

  public goMain() {
    this.router.navigate(['/home'], { replaceUrl: true });;
  }

  public async heal() {
    this.animation_heal.play();
    // Abre modal y bloquea el salir de la app
    this.showModal();

    let currentWidth = 0;

    // Elimina los elementos null o undefined del array
    this.pokemonsMaster = this.pokemonsMaster.filter((element: PokemonInterface | null | undefined) => element !== null && element !== undefined);

    // Establece el HP de cada Pokémon al máximo
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
        // Cierra modal y para animacion
        this.hideModal();
        this.animation_heal.stop();
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    }, 90); // Actualiza cada segundo
  }

  calculateHpPercentage(pokemon: any): number {
    return (pokemon.hp / pokemon.hp_max) * 100;
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
    //n Define un Pokémon ficticio para rellenar
    let defaultPokemon: PokemonInterface = { ...this.constants.poke_empty};
    defaultPokemon.num_nation = '';

    // Copia el array original
    const filledArray = [...array];

    // Remplaza los vacios o /null por Default Pokemon
    for (let i = 0; i < filledArray.length; i++) {
      if (filledArray[i] == null || filledArray[i] == undefined) {
        filledArray[i] = defaultPokemon;
      }
    }
    
    // Añade elementos ficticios hasta alcanzar el tamaño máximo
    while (filledArray.length < maxSize) {
      filledArray.push(defaultPokemon);
    }

    return filledArray;
  }

  /**
   * Mostramos el modal modificando una variable customizada en variables.scss
   */
  private showModal() {
    document.documentElement.style.setProperty('--display-modal', 'block');
  }

  /**
   * Ocultamos el modal modificando una variable customizada en variables.scss
   */
  private hideModal() {
    document.documentElement.style.setProperty('--display-modal', 'none');
  }

}
