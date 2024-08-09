import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'app-catch',
  templateUrl: './catch.page.html',
  styleUrls: ['./catch.page.scss'],
})
export class CatchPage implements OnInit {
  // Pokemon a capturar
  private numNacional: string;
  public pokeSalvaje: PokemonInterface;
  public pokemonBatalla: PokemonInterface;
  // Variables de Ocultar y mostrar
  public pokeOculto: String; public ocultar1: String; public ocultar2: String; public ocultar3: String;
  public ocultar4: String; public ocultarEquipo: any; public ocultarBalls: any; public display: any;
  // Variables de Configuracion
  public barraHP: any; public barraHP2: any; public barraExp: any;
  // Variables de batalla
  public modal: Boolean; public flip: string; public daño: any;
  public bonustipo: number; public efectividad: number; public variacion: number; public potencia: number;

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
  ) {
    this.numNacional = '';
    this.pokeSalvaje = this.constants.poke_empty;
    this.numNacional = this.router.snapshot.paramMap.get('id')!;
    this.apareceSalvaje();

    this.audio.cargarAudios();

    this.pokemonBatalla = this.repo.getEquipoPokemon()[0];
    this.barraHP = { width: '100%' }; this.barraHP2 = { width: '100%' }; this.barraExp = { width: '0%' };
    this.pokeOculto = 'show'; this.ocultar1 = 'hide'; this.ocultar2 = 'hide'; this.ocultar3 = 'hide'; this.ocultar4 = 'hide';
    this.modal = true; this.flip = ''; this.daño = 0;
    this.ocultarEquipo = { display: 'flex' }; this.ocultarBalls = { display: 'none' }; this.display = false;
    this.bonustipo = 1; this.efectividad = 1; this.variacion = 1; this.potencia = 100;
  }

  ngOnInit(): void {
    this.repo.getMaster();
    this.repo.getEquipoPokemon();
  }

  public atacar() {
    if (this.pokemonBatalla.velocidad >= this.pokeSalvaje.velocidad) {
      this.atacarSalvaje();
      this.ser_atacado();
    } else {
      this.ser_atacado();
      this.atacarSalvaje();
    }
  }

  private atacarSalvaje() {
    this.calcular_variables(this.pokemonBatalla, this.pokeSalvaje);
    this.pokeSalvaje.hp = this.convertirEntero(this.pokeSalvaje.hp);
    this.pokeSalvaje.hp_max = this.convertirEntero(this.pokeSalvaje.hp_max);

    if (this.pokemonBatalla.hp > 0) {
      if (this.pokeSalvaje.hp > 0) {
        if (this.pokeSalvaje.hp >= this.daño) {
          this.pokeSalvaje.hp -= this.convertirEntero(this.daño);
        } else {
          this.pokeSalvaje.hp = 0;
          let pokevo = this.pokemonBatalla;
          this.pokemonBatalla = this.lvup.obtenerExpPokemon(this.pokemonBatalla, this.pokeSalvaje);
          this.repo.updatePokemonBatalla(this.pokemonBatalla);
          this.barraExp = this.lvup.calcularBarraExp(this.barraExp, this.pokemonBatalla);
          this.repo.setMaster(this.lvup.obtenerExpMaster(this.repo.getMaster(), this.pokeSalvaje));
          this.fire.addMaster(this.repo.getMaster());
          // Actualizar el pokemon evolucionado al array del repositorio.
          if (pokevo.evolucion === this.pokemonBatalla.numero_nacional) {
            this.repo.evoEquipo(pokevo, this.pokemonBatalla);
          }
          this.barraExp = this.lvup.calcularBarraExp(this.barraExp, this.pokemonBatalla);
          this.route.navigateByUrl('/main/avatar');
        }
        this.barraHP = this.lvup.calcularBarraHpPokemon(this.barraHP, this.pokeSalvaje.hp, this.pokeSalvaje.hp_max);
      }
    }
  }

  private ser_atacado() {
    this.calcular_variables(this.pokeSalvaje, this.pokemonBatalla);
    this.pokemonBatalla.hp = this.convertirEntero(this.pokemonBatalla.hp);
    this.pokemonBatalla.hp_max = this.convertirEntero(this.pokemonBatalla.hp_max);

    if (this.pokemonBatalla.hp >= this.daño && this.pokemonBatalla.hp != 0) {
      this.pokemonBatalla.hp -= this.convertirEntero(this.daño);
    } else if (this.pokemonBatalla.hp <= this.daño) {
      this.pokemonBatalla.hp = 0;
    }

    if (this.pokeSalvaje.hp <= 0) {
      this.route.navigateByUrl('/main/avatar');
    }

    this.barraHP2 = this.lvup.calcularBarraHpPokemon(this.barraHP2, this.pokemonBatalla.hp, this.pokemonBatalla.hp_max);
  }

  public cambiar_pokemon(poke_cambio: PokemonInterface) {
    this.pokemonBatalla = poke_cambio;
    this.calcular_variables(this.pokemonBatalla, this.pokeSalvaje);
  }

  public capturarPokeBall() {
    // if (this.repo.getMaster().pokeBalls > 0) {
      this.repo.getMaster().pokeBalls -= 1;
      this.modal = false; setTimeout(() => { this.modal = true; }, 7000);
      this.resetAnimacion('pokeball', 'catch1', 'star1', 'star2', 'star3');
      this.audio.play('audioAtrapando');
      this.pokeOculto = 'hide'; this.ocultar1 = 'show'; this.ocultar2 = 'hide'; this.ocultar3 = 'hide'; this.ocultar4 = 'hide';

      if (this.captura(this.pokeSalvaje.numero_nacional, 'poke')) {
        this.pokeSalvaje.ball = 'pokeball';

        setTimeout(() => {
          this.audio.play('audioSacudidaPokeball');
          setTimeout(() => {
            this.audio.play('audioCapturado');
            setTimeout(async () => {
              this.repo.setMaster(this.lvup.obtenerExpMaster(this.repo.getMaster(), this.pokeSalvaje));
              this.fire.addMaster(this.repo.getMaster());
              this.anadirPokemon();
              //this.route.dispose();
              await this.route.navigateByUrl('/main/avatar');
            }, 1000);
          }, 4000);
        }, 3000);

      } else {
        setTimeout(() => {
          this.audio.play('audioSacudidaPokeball');
          setTimeout(() => {
            this.audio.play('audioEscapado');
            this.ocultar1 = 'hide';
            this.pokeOculto = 'show';
            this.pokeSalvaje.ball = '';
          }, 3000);
        }, 3000);
      }
    // } else {
    //   alert('No tienes poke balls');
    // }
  }

  capturarSuperBall() {
    if (this.repo.getMaster().superBalls > 0) {
      this.repo.getMaster().superBalls -= 1;
      this.modal = false; setTimeout(() => { this.modal = true; }, 7000);
      this.resetAnimacion('superball', 'catch2', 'star4', 'star5', 'star6');
      this.audio.play('audioAtrapando');
      this.pokeOculto = 'hide'; this.ocultar1 = 'hide'; this.ocultar2 = 'show'; this.ocultar3 = 'hide'; this.ocultar4 = 'hide';

      if (this.captura(this.pokeSalvaje.numero_nacional, 'super')) {
        this.pokeSalvaje.ball = 'superball';

        setTimeout(() => {
          this.audio.play('audioSacudidaPokeball');
          setTimeout(() => {
            this.audio.play('audioCapturado');
            setTimeout(() => {
              this.repo.setMaster(this.lvup.obtenerExpMaster(this.repo.getMaster(), this.pokeSalvaje));
              this.fire.addMaster(this.repo.getMaster());
              this.anadirPokemon();
              //this.route.dispose();
              this.route.navigateByUrl('/main/avatar');
            }, 1000);
          }, 4000);
        }, 3000);

      } else {
        setTimeout(() => {
          this.audio.play('audioSacudidaPokeball');
          setTimeout(() => {
            this.audio.play('audioEscapado');
            this.ocultar2 = 'hide';
            this.pokeOculto = 'show';
            this.pokeSalvaje.ball = '';
          }, 3000);
        }, 3000);
      }
    } else {
      alert('No tienes super balls');
    }
  }

  capturarUltraBall() {
    if (this.repo.getMaster().ultraBalls > 0) {
      this.repo.getMaster().ultraBalls -= 1;
      this.modal = false; setTimeout(() => { this.modal = true; }, 7000);
      this.resetAnimacion('ultraball', 'catch3', 'star7', 'star8', 'star9');
      this.audio.play('audioAtrapando');
      this.pokeOculto = 'hide'; this.ocultar1 = 'hide'; this.ocultar2 = 'hide'; this.ocultar3 = 'show'; this.ocultar4 = 'hide';

      if (this.captura(this.pokeSalvaje.numero_nacional, 'ultra')) {
        this.pokeSalvaje.ball = 'ultraball';

        setTimeout(() => {
          this.audio.play('audioSacudidaPokeball');
          setTimeout(() => {
            this.audio.play('audioCapturado');
            setTimeout(() => {
              this.repo.setMaster(this.lvup.obtenerExpMaster(this.repo.getMaster(), this.pokeSalvaje));
              this.fire.addMaster(this.repo.getMaster());
              this.anadirPokemon();
              //this.route.dispose();
              this.route.navigateByUrl('/main/avatar');
            }, 1000);
          }, 4000);
        }, 3000);

      } else {
        setTimeout(() => {
          this.audio.play('audioSacudidaPokeball');
          setTimeout(() => {
            this.audio.play('audioEscapado');
            this.ocultar3 = 'hide';
            this.pokeOculto = 'show';
            this.pokeSalvaje.ball = '';
          }, 3000);
        }, 3000);
      }
    } else {
      alert('No tienes ultra balls');
    }
  }

  capturarMasterBall() {
    if (this.repo.getMaster().masterBalls > 0) {
      this.repo.getMaster().masterBalls -= 1;
      this.modal = false; setTimeout(() => { this.modal = true; }, 7000);
      this.resetAnimacion('masterball', 'catch1', 'star1', 'star2', 'star3');
      this.audio.play('audioAtrapando');
      this.pokeOculto = 'hide'; this.ocultar1 = 'hide'; this.ocultar2 = 'hide'; this.ocultar3 = 'hide'; this.ocultar4 = 'show';

      if (this.captura(this.pokeSalvaje.numero_nacional, 'master')) {
        this.pokeSalvaje.ball = 'masterball';

        setTimeout(() => {
          this.audio.play('audioSacudidaPokeball');
          setTimeout(() => {
            this.audio.play('audioCapturado');
            setTimeout(() => {
              this.repo.setMaster(this.lvup.obtenerExpMaster(this.repo.getMaster(), this.pokeSalvaje));
              this.fire.addMaster(this.repo.getMaster());
              this.anadirPokemon();
              //this.route.dispose();
              this.route.navigateByUrl('/main/avatar');
            }, 1000);
          }, 4000);
        }, 3000);

      } else {
        setTimeout(() => {
          this.audio.play('audioSacudidaPokeball');
          setTimeout(() => {
            this.audio.play('audioEscapado');
            this.ocultar4 = 'hide';
            this.pokeOculto = 'show';
            this.pokeSalvaje.ball = '';
          }, 3000);
        }, 3000);
      }
    } else {
      alert('No tienes master balls');
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
    let ratioBall = 0.0; let ratioCaptura = 0.0; let rand = 0.0; let bonus = 0.0; let a = 0.0;
    let capturados = false; let ratioPoke = 0;
    this.pokeSalvaje.ball = 'nada'; let numEstado = 0;

    if (this.pokeSalvaje.estado === '') { this.pokeSalvaje.estado = 'nada'; }
    console.log(poke);
    ratioCaptura = this.RatioCaptura.getRatioCaptura(poke);
    console.log(ratioCaptura);

    switch (ball.toLowerCase().substring(0, 4)) {
      case 'poke':
        ratioPoke = 200;
        rand = (Math.random() * (0 - ratioPoke + 1) + ratioPoke);
        ratioBall = 1.5;
        numEstado = this.getNumEstado(this.pokeSalvaje.estado);
        break;
      case 'supe':
        ratioPoke = 150;
        rand = (Math.random() * (0 - ratioPoke + 1) + ratioPoke);
        ratioBall = 2.0;
        numEstado = this.getNumEstado(this.pokeSalvaje.estado);
        break;
      case 'ultr':
        ratioPoke = 100;
        rand = (Math.random() * (0 - ratioPoke + 1) + ratioPoke);
        ratioBall = 2.5;
        numEstado = this.getNumEstado(this.pokeSalvaje.estado);
        break;
      case 'mast':
        ratioPoke = 1;
        rand = 0;
        ratioBall = 255;
        numEstado = this.getNumEstado(this.pokeSalvaje.estado);
        break;
    }

    a = (((3 * this.pokeSalvaje.hp_max - 1 * this.pokeSalvaje.hp) * ratioCaptura * ratioBall) / (1 * this.pokeSalvaje.hp_max)) + numEstado + bonus;
    console.log(`(((3 * ${this.pokeSalvaje.hp_max} - 1 * ${this.pokeSalvaje.hp}) * ${ratioCaptura} * ${ratioBall}) / (1 * ${this.pokeSalvaje.hp_max})) + ${numEstado} + ${bonus};`);
    console.log(a);

    if (a < 1) { a = 1; } else if (a > 255) { a = 255; }

    // a = this.convertirEntero(a);
    if (rand <= a) { capturados = true; }

    return capturados;
  }

  /**
   * Obtiene el numero de bonificación por el estado alterado de un pokemon.
   * 
   * Estados:
   *  - dormidoCongelado (Dormido o congelado).
   *  - enveParaQuema (envenenado, paralizado o quemado).
   * 
   * @param estado Estado alterado en el que se encuentra un pokemon.
   */
  private getNumEstado(estado: String): number {
    let numEstado = 0.0;
    switch (estado) {
      case 'dormidoCongelado':
        numEstado = 25.0;
        break;
      case 'enveParaQuema':
        numEstado = 12.0;
        break;
      case 'nada':
        numEstado = 0.0;
        break;
    }
    return numEstado;
  }

  private async anadirPokemon() {
    try {
      await this.fire.addPokemonAtrapado(this.pokeSalvaje).then(() => {
        this.toast.presentarToast('Se ha añadido el pokemon a la base de datos', 'success', 3000);
      }).catch(() => {
        this.toast.presentarToast('No se ha podido añadir el pokemon a la base de datos', 'danger ', 3000);
      });
    } catch (e) {
      // this.db.addPokemon(this.pokeSalvaje);
      // this.db.addPokemonAtrapado(this.pokeSalvaje);
    }

    this.repo.updatePokeRegionActual(this.pokeSalvaje);
  }

  public convertirEntero(numero: any) { numero = parseInt(numero + '', 10); return numero; }

  private resetAnimacion(ball: string, botonRojo: string, star1: string, star2: string, star3: string) {
    let poke = document.getElementById(ball)!;
    poke.style.animation = 'none';
    poke.offsetHeight; /* trigger reflow */
    poke.style.animation = '';

    const luzRoja = document.getElementById(botonRojo)!;
    luzRoja.style.animation = 'none';
    luzRoja.offsetHeight;
    luzRoja.style.animation = '';

    const estrella1 = document.getElementById(star1)!;
    estrella1.style.animation = 'none';
    estrella1.offsetHeight;
    estrella1.style.animation = '';

    const estrella2 = document.getElementById(star2)!;
    estrella2.style.animation = 'none';
    estrella2.offsetHeight;
    estrella2.style.animation = '';

    const estrella3 = document.getElementById(star3)!;
    estrella3.style.animation = 'none';
    estrella3.offsetHeight;
    estrella3.style.animation = '';
  }

  private apareceSalvaje() {
    this.pokeSalvaje = this.stats.getStatsPokemon(this.numNacional);
    this.pokeSalvaje.nivel = this.lvup.nivelRango5(this.repo.getMaster());
    this.pokeSalvaje = this.lvup.calcularStats(this.pokeSalvaje);
  }

  public voltear() {
    if (this.flip === 'is-flipped') {
      this.flip = '';
    } else { this.flip = 'is-flipped' };
  }

  private calcular_variables(pokeAtaca: PokemonInterface, pokeDefensa: PokemonInterface) {
    let aux = 0;
    this.variacion = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
    // Calculo de efectividad
    let rangoCritico = [
      0, 0,
      0.25, 0.25, 0.25, 0.25, 0.25,
      0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      2, 2, 2, 2, 2,
      4];
    this.efectividad = rangoCritico[Math.floor(Math.random() * rangoCritico.length)];
    // Calculo de daño
    aux = ((0.2 * pokeAtaca.nivel! + 1) * pokeAtaca.ataque * this.potencia) / (25 * pokeDefensa.defensa) + 2;
    this.daño = this.convertirEntero(0.01 * this.bonustipo * this.efectividad * this.variacion * aux);
    this.barraHP2 = this.lvup.calcularBarraHpPokemon(this.barraHP2, pokeAtaca.hp, pokeAtaca.hp_max);
    this.barraExp = this.lvup.calcularBarraExp(this.barraExp, pokeAtaca);
  }

  public huir() { this.route.navigateByUrl('/main/avatar'); }

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

}
