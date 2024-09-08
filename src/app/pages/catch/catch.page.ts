import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationController } from '@ionic/angular';
import { timeInterval } from 'rxjs';
import { Master } from 'src/app/model/Master';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { AudioService } from 'src/app/services/audio.service';
import { ConstantService } from 'src/app/services/constant.service';
import { DatabaseService } from 'src/app/services/database.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LvupService } from 'src/app/services/lvup.service';
import { PosibilidadCapturaService } from 'src/app/services/posibilidad-captura.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { StatsService } from 'src/app/services/stats.service';
import { ToastService } from 'src/app/services/toast.service';

interface MasterBalls {
  pokeBalls: number;
  superBalls: number;
  ultraBalls: number;
  masterBalls: number;
}

@Component({
  selector: 'app-catch',
  templateUrl: './catch.page.html',
  styleUrls: ['./catch.page.scss'],
})
export class CatchPage implements OnInit {
  @ViewChild('pokeballee', { read: ElementRef, static: true }) pokeball!: ElementRef;
  @ViewChild('catch1', { read: ElementRef, static: true }) catch1!: ElementRef;
  @ViewChild('star1', { read: ElementRef, static: true }) star1!: ElementRef;
  @ViewChild('star2', { read: ElementRef, static: true }) star2!: ElementRef;
  @ViewChild('star3', { read: ElementRef, static: true }) star3!: ElementRef;
  imagenUrl: string = '../../../assets/images/item_pokemon/pokeball.png';
  star1Animation: any;
  star2Animation: any;
  star3Animation: any;
  wiggleAnimation: any;
  throwBallAnimation: any;
  catchAnimation: any;

  // Styles HP and EXP bar
  public barraHP_wild: any; public barraHP_battle: any; public barraHP_1: any; public barraHP_2: any;
  public barraHP_3: any; public barraHP_4: any; public barraHP_5: any; public barraHP_6: any; 
  public barraExp: any;
  // Pokemon a capturar
  numNacional: string;
  public poke_team: PokemonInterface[] = [];
  public pokeSalvaje: PokemonInterface;
  public pokemonBatalla: PokemonInterface;
  // Variables de Ocultar y mostrar
  public pokeOculto: String; public ocultar1: String; public ocultar2: String; public ocultar3: String;
  public ocultar4: String; public ocultarEquipo: any; public ocultarBalls: any; public display: any;
  // Variables de batalla
  public modal: Boolean; public flip: string; public daño: any;
  public bonustipo: number; public efectividad: number; public variacion: number; public potencia: number;
  exp_max: number = 0;

  constructor(
    private RatioCaptura: PosibilidadCapturaService,
    private stats: StatsService,
    private route: Router,
    private router: ActivatedRoute,
    private fire: FirebaseService,
    private audio: AudioService,
    public repo: RepositoryService,
    private db: DatabaseService,
    private lvup: LvupService,
    private toast: ToastService,
    private constants: ConstantService,
    private animationCtrl: AnimationController
  ) {
    this.numNacional = '';
    this.pokeSalvaje = this.constants.poke_empty;
    this.numNacional = this.router.snapshot.paramMap.get('id')!;

    this.audio.cargarAudios();

    this.poke_team = this.repo.getEquipoPokemon();
    this.pokemonBatalla = this.repo.getEquipoPokemon()[0];
    // this.pokemonBatalla = this.stats.getStatsPokemon('158');
    // this.pokemonBatalla.genero = 'macho';
    this.exp_max = Math.pow(this.pokemonBatalla.level!, 3);

    let aux_style = { width: '100%' };
    this.barraHP_wild = aux_style; this.barraHP_battle = aux_style;
    this.barraHP_1 = aux_style; this.barraHP_2 = aux_style; this.barraHP_3 = aux_style;
    this.barraHP_4 = aux_style; this.barraHP_5 = aux_style; this.barraHP_6 = aux_style;
    this.barraExp = aux_style;

    this.pokeOculto = 'show'; this.ocultar1 = 'hide'; this.ocultar2 = 'hide'; this.ocultar3 = 'hide'; this.ocultar4 = 'hide';
    this.modal = true; this.flip = ''; this.daño = 0;
    this.ocultarEquipo = { display: 'flex' }; this.ocultarBalls = { display: 'none' }; this.display = false;
    this.bonustipo = 1; this.efectividad = 1; this.variacion = 1; this.potencia = 100;
  }

  async ngOnInit() {
    await this.apareceSalvaje();
    this.repo.getMaster();
    this.repo.getEquipoPokemon();
  }

  public atacar() {
    if (this.pokemonBatalla.speed >= this.pokeSalvaje.speed) {
      this.atacarSalvaje();
      this.ser_atacado();
    } else {
      this.ser_atacado();
      this.atacarSalvaje();
    }
  }

  private atacarSalvaje() {
    let master: Master = this.repo.getMaster();
    this.calcular_variables(this.pokemonBatalla, this.pokeSalvaje);
    this.pokeSalvaje.hp = this.convertirEntero(this.pokeSalvaje.hp);
    this.pokeSalvaje.hp_max = this.convertirEntero(this.pokeSalvaje.hp_max);
  
    if (this.pokemonBatalla.hp > 0) {
      if (this.pokeSalvaje.hp > 0) {
        if (this.pokeSalvaje.hp >= this.daño) {
          this.pokeSalvaje.hp -= this.convertirEntero(this.daño);
        } else {
          this.pokeSalvaje.hp = 0;
          let pokevo = { ...this.pokemonBatalla };
          let poke_wild = { ...this.pokeSalvaje };
          // this.exp_max = Math.pow(pokevo.level!, 3);
          this.pokemonBatalla = this.lvup.obtenerExpPokemon(this.pokemonBatalla, poke_wild.level!);
          this.exp_max = Math.pow(this.pokemonBatalla.level!, 3);
          // master.team = this.repo.updatePokemonBatalla(this.pokemonBatalla);
          // this.barraExp = this.lvup.calcularBarraExp(this.barraExp, this.pokemonBatalla);
          this.repo.setMaster(this.lvup.obtenerExpMaster(master, this.pokeSalvaje));

          // Verificar si el Pokémon puede evoar antes de actualizar el equipo
          if (pokevo.evo === this.pokemonBatalla.num_nation) {
            this.repo.evoEquipo(pokevo, this.pokemonBatalla);
          }

          this.fire.updateMaster(this.repo.getMaster());
          // this.barraExp = this.lvup.calcularBarraExp(this.barraExp, this.pokemonBatalla);
          this.goMain();
        }

        // this.barraHP_wild = 
        // this.lvup.calcularBarraHpPokemon(this.barraHP_wild, this.pokeSalvaje.hp, this.pokeSalvaje.hp_max);
      }
    }
  }

  private ser_atacado() {
    this.calcular_variables(this.pokeSalvaje, this.pokemonBatalla);
    this.pokemonBatalla.hp = this.convertirEntero(this.pokemonBatalla.hp);
    this.pokemonBatalla.hp_max = this.convertirEntero(this.pokemonBatalla.hp_max);
  
    if (this.pokemonBatalla.hp > 0) {
      this.pokemonBatalla.hp -= Math.min(this.pokemonBatalla.hp, this.convertirEntero(this.daño));
    }
  
    if (this.pokemonBatalla.hp === 0 || this.pokeSalvaje.hp <= 0) {
      this.goMain();
    }
  }
 
  public cambiar_pokemon(poke_cambio: PokemonInterface) {
    this.pokemonBatalla = poke_cambio;
    this.exp_max = Math.pow(poke_cambio.level!, 3);
    this.calcular_variables(this.pokemonBatalla, this.pokeSalvaje);
  }

  public async capturarPokemon(ballType: 'poke' | 'super' | 'ultra' | 'master') {
    const ballMap = {
      poke: {
        stock: 'pokeBalls' as keyof MasterBalls,
        img: '../../../assets/images/item_pokemon/pokeball.png',
        ocultar: ['show', 'hide', 'hide', 'hide'],
      },
      super: {
        stock: 'superBalls' as keyof MasterBalls,
        img: '../../../assets/images/item_pokemon/superball.png',
        ocultar: ['hide', 'show', 'hide', 'hide'],
      },
      ultra: {
        stock: 'ultraBalls' as keyof MasterBalls,
        img: '../../../assets/images/item_pokemon/ultraball.png',
        ocultar: ['hide', 'hide', 'show', 'hide'],
      },
      master: {
        stock: 'masterBalls' as keyof MasterBalls,
        img: '../../../assets/images/item_pokemon/masterball.png',
        ocultar: ['hide', 'hide', 'hide', 'show'],
      }
    };
  
    const ball = ballMap[ballType];
    const master = this.repo.getMaster();
    
    console.log(master);
    // Aseguramos que el stock es un número
    const ballCount = master[ball.stock] as number;
    console.log(master[ball.stock]);
    console.log(ballCount);
    
    if (ballCount > 0) {
      master[ball.stock] = ballCount - 1;
      this.modal = false; 
      setTimeout(() => { this.modal = true; }, 7000);
      this.imagenUrl = ball.img;
      this.startAnimation();
      this.audio.play('audioAtrapando');
      this.pokeOculto = 'hide';
      [this.ocultar1, this.ocultar2, this.ocultar3, this.ocultar4] = ball.ocultar;
  
      if (this.captura(this.pokeSalvaje.num_nation, ballType)) {
        this.pokeSalvaje.ball = ballType + 'ball';
  
        setTimeout(() => {
          this.audio.stopAudio('audioAtrapando');
          this.audio.play('audioSacudidaPokeball');
          setTimeout(() => {
            this.audio.stopAudio('audioSacudidaPokeball');
            this.audio.play('audioCapturado');
            this.star1Animation.play();
            this.star2Animation.play();
            this.star3Animation.play();
            setTimeout(async () => {
              this.stopAnimation();
              // ¿add balls? ¿exp pokemon?
              this.repo.setMaster(this.lvup.obtenerExpMaster(this.repo.getMaster(), this.pokeSalvaje));
              this.fire.addMaster(this.repo.getMaster());
              this.anadirPokemon();
              this.goMain();
            }, 1000);
          }, 4300);
        }, 4000);
      } else {
        setTimeout(() => {
          this.audio.play('audioSacudidaPokeball');
          setTimeout(() => {
            this.audio.play('audioEscapado');
            this.stopAnimation();
            this.pokeOculto = 'show';
            this.pokeSalvaje.ball = '';
            [this.ocultar1, this.ocultar2, this.ocultar3, this.ocultar4] = ['hide', 'hide', 'hide', 'hide'];
          }, 4300);
        }, 4000);
      }
    } else {
      alert(`No tienes ${ballType} balls`);
    }
  }

  /**
   * Determina si captura o no a un pokemon.
   * Bonus:
   *  - 25 dormido/congelado
   *  - 12 envenenado/quemado/paralizado
   *  - 0  el resto
   * 
   * pokeball = 'ultra'; // poke / super / ultra / master
   *
   * @param poke Pokemon al que se quiere capturar.
   * @param pokeball Ball que se lanza para atrapar al pokemon.
   * @return dfg
   */
  private captura(poke: string, ball: string): boolean {
    const { ratioPoke, ratioBall } = this.getRatioPorBall(ball);
    const rand = (Math.random() * (0 - ratioPoke + 1) + ratioPoke);
    const numstate = this.getNumstate(this.pokeSalvaje.state);
    const ratioCaptura = this.RatioCaptura.getRatioCaptura(poke);
  
    let a = (((3 * this.pokeSalvaje.hp_max - 1 * this.pokeSalvaje.hp) * ratioCaptura * ratioBall) / 
             (1 * this.pokeSalvaje.hp_max)) + numstate;
    a = Math.min(Math.max(a, 1), 255);
  
    return rand <= a;
  }

  private getRatioPorBall(ball: string): { ratioPoke: number, ratioBall: number } {
    switch (ball.toLowerCase().substring(0, 4)) {
      case 'poke':
        return { ratioPoke: 200, ratioBall: 1.5 };
      case 'supe':
        return { ratioPoke: 150, ratioBall: 2.0 };
      case 'ultr':
        return { ratioPoke: 100, ratioBall: 2.5 };
      case 'mast':
        return { ratioPoke: 1, ratioBall: 255 };
      default:
        return { ratioPoke: 0, ratioBall: 0 };
    }
  }

  /**
   * Obtiene el numero de bonificación por el state alterado de un pokemon.
   * 
   * states:
   *  - dormidoCongelado (Dormido o congelado).
   *  - enveParaQuema (envenenado, paralizado o quemado).
   * 
   * @param state state alterado en el que se encuentra un pokemon.
   */
  private getNumstate(state: String): number {
    let numstate = 0.0;
    switch (state) {
      case 'dormidoCongelado':
        numstate = 25.0;
        break;
      case 'enveParaQuema':
        numstate = 12.0;
        break;
      case 'nada':
        numstate = 0.0;
        break;
    }
    return numstate;
  }

  private async anadirPokemon() {
    try {
      await this.fire.addPokemonAtrapado(this.pokeSalvaje);
      this.toast.presentarToast('Se ha añadido el pokemon a la base de datos', 'success', 3000);
    } catch (e) {
      this.toast.presentarToast('No se ha podido añadir el pokemon a la base de datos', 'danger', 3000);
    }
  
    this.repo.updatePokeRegionActual(this.pokeSalvaje);
  }
  
  public convertirEntero(numero: any) { numero = parseInt(numero + '', 10); return numero; }

  private async apareceSalvaje() {
    this.pokeSalvaje = await this.stats.getStatsPokemonV2(this.numNacional);
    this.pokeSalvaje.level = this.lvup.levelRango5(this.repo.getMaster());
    this.pokeSalvaje = this.lvup.calcularStats(this.pokeSalvaje);
  }

  public voltear() {
    if (this.flip === 'is-flipped') {
      this.flip = '';
    } else { this.flip = 'is-flipped' };
  }

  private calcular_variables(pokeAtaca: PokemonInterface, pokedefense: PokemonInterface) {
    this.variacion = this.calcularVariacion();
    this.efectividad = this.calcularEfectividad();
    this.daño = this.calcularDanio(pokeAtaca, pokedefense);
    this.barraHP_battle = this.lvup.calcularBarraHpPokemon(this.barraHP_battle, pokeAtaca.hp, pokeAtaca.hp_max);
    this.barraExp = this.lvup.calcularBarraExp(this.barraExp, pokeAtaca);
  }
  
  private calcularVariacion(): number {
    return Math.floor(Math.random() * (100 - 85 + 1)) + 85;
  }
  
  private calcularEfectividad(): number {
    const rangoCritico = [
      0, 0, 0.25, 0.25, 0.25, 0.25, 0.25,
      0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      2, 2, 2, 2, 2,
      4
    ];
    return rangoCritico[Math.floor(Math.random() * rangoCritico.length)];
  }
  
  private calcularDanio(pokeAtaca: PokemonInterface, pokedefense: PokemonInterface): number {
    const aux = ((0.2 * pokeAtaca.level! + 1) * pokeAtaca.attack * this.potencia) / (25 * pokedefense.defense) + 2;
    return this.convertirEntero(0.01 * this.bonustipo * this.efectividad * this.variacion * aux);
  }

  public huir() {
    setTimeout(() => { this.route.navigate(['/home'], { replaceUrl: true }); }, 1000);
  }

  public goMain() {
    setTimeout(() => { this.route.navigate(['/home'], { replaceUrl: true }); }, 3000);
  }

  public mostrarPokeballs() {
    if (this.display) {
      this.display = false;
      this.ocultarEquipo = { display: 'flex' };
      this.ocultarBalls = { display: 'none' };
    } else {
      this.display = true;
      this.ocultarEquipo = { display: 'none' };
      this.ocultarBalls = { display: 'flex' };
    }
  }

  async startAnimation() {
    let bal: HTMLElement | null = document.querySelector('.pokeballee');
    let star1: HTMLElement | null = document.querySelector('.star1');
    let star2: HTMLElement | null = document.querySelector('#star2');
    let star3: HTMLElement | null = document.querySelector('#star3');
    let catc: HTMLElement | null = document.querySelector('#catch1');

    this.throwBallAnimation = this.animationCtrl.create().addElement(bal!).duration(4000).iterations(1).keyframes([
      { offset: 0, top: 'calc(75% - 100px)', left: 'calc(0% - 100px)', transform: 'scale(0.5)', easing: 'ease-out' },
      { offset: 0.8, top: 'calc(25% - 100px)', transform: 'scale(0.9)' },
      { offset: 1, top: 'calc(29% - 100px)', left: 'calc(90% - 100px)', transform: 'scale(1)' }
    ]);

    this.wiggleAnimation = this.animationCtrl.create().addElement(bal!).duration(1300).iterations(3).delay(4000).keyframes([
      { offset: 0, transform: 'translateX(0) rotate(0)' },
      { offset: 0.2, transform: 'translateX(-10px) rotate(-10deg)' },
      { offset: 0.3, transform: 'translateX(10px) rotate(10deg)' },
      { offset: 0.5, transform: 'translateX(-10px) rotate(-10deg)' },
      { offset: 0.6, transform: 'translateX(10px) rotate(10deg)' },
      { offset: 1, transform: 'translateX(0) rotate(0)' }
    ]);

    this.catchAnimation = this.animationCtrl.create().addElement(catc!).duration(1300).iterations(3).delay(4000).keyframes([
      { offset: 0.0, backgroundColor: 'rgba(0, 0, 0, 0)' },
      // { offset: 0.2, backgroundColor: 'rgba(255, 0, 0, 0.6)' },
      // { offset: 0.3, backgroundColor: 'rgba(0, 0, 0, 0)' },
      // { offset: 0.5, backgroundColor: 'rgba(255, 0, 0, 0.6)' },
      // { offset: 0.6, backgroundColor: 'rgba(0, 0, 0, 0)' },
      // { offset: 0.8, backgroundColor: 'rgba(255, 0, 0, 0.6)' },
      // { offset: 0.99, backgroundColor: 'rgba(0, 0, 0, 0)' },
      { offset: 0.9, backgroundColor: 'rgba(0, 0, 0, 0)' },
      { offset: 1.0, backgroundColor: 'rgba(255, 0, 0, 0.6)' }
    ]);

    this.star1Animation = this.animationCtrl.create().addElement(star1!).duration(500).iterations(1).keyframes([
      { offset: 0.0, top: '0', left: '0', opacity: 0, transform: 'rotate(0)' },
      { offset: 0.1, top: '0', left: '0', opacity: 1 },
      { offset: 0.4, top: '-70px', left: '-30px', opacity: 1, transform: 'scale(1)' },
      { offset: 0.8, top: '-50px', left: '-50px', opacity: 1, transform: 'rotate(-45deg) scale(1.2)' },
      { offset: 1.0, top: '-50px', left: '-50px', opacity: 0, transform: 'rotate(-45deg) scale(1.2)' },
    ]);
    this.star2Animation = this.animationCtrl.create().addElement(star2!).duration(500).iterations(1).keyframes([
      { offset: 0.0, top: '0', opacity: 0, transform: 'rotate(0)' },
      { offset: 0.1, top: '0', opacity: 1 },
      { offset: 0.4, top: '-90px', opacity: 1, transform: 'scale(1)' },
      { offset: 0.8, top: '-70px', opacity: 1, transform: 'scale(1.2)' },
      { offset: 1.0, top: '-70px', opacity: 0, transform: 'scale(1.2)' }
    ]);
    this.star3Animation = this.animationCtrl.create().addElement(star3!).duration(500).iterations(1).keyframes([
      { offset: 0.0, top: '0', opacity: 0, transform: 'rotate(0)' },
      { offset: 0.1, top: '0', opacity: 1 },
      { offset: 0.4, top: '-70px', left: 'calc(70% + 30px)', opacity: 1, transform: 'scale(1)' },
      { offset: 0.8, top: '-50px', left: 'calc(70% + 50px)', opacity: 1, transform: 'rotate(45deg) scale(1.2)' },
      { offset: 1.0, top: '-50px', left: 'calc(70% + 50px)', opacity: 0, transform: 'rotate(45deg) scale(1.2)' },
    ]);

    this.throwBallAnimation.play();
    this.wiggleAnimation.play();
    this.catchAnimation.play();
  }

  async stopAnimation() {
    this.throwBallAnimation.stop();
    this.wiggleAnimation.stop();
    this.catchAnimation.stop();
    this.star1Animation.stop();
    this.star2Animation.stop();
    this.star3Animation.stop();
  }

  calculateHpPercentage(pokemon: any): number {
    return (pokemon.hp / pokemon.hp_max) * 100;
  }

}
