import { Injectable } from '@angular/core';
import { Master } from '../model/Master';
import { PokemonInterface } from '../model/Pokemon';
import { StatsService } from './stats.service';

@Injectable({
  providedIn: 'root'
})
export class LvupService {
  private contenedorExpPokemon: number = 0;

  constructor( private stats: StatsService ) { }

  public calcularBarraHpPokemon(barraHp: any, vida: number, vida_max: number) {
    if (barraHp != undefined) {
      return barraHp = { width: ((vida * 100) / vida_max) + '%' };
    } else {
      return barraHp = { width: '0%' };
    }
  }

  public calcularBarraExp(barraExp: any, entidad: PokemonInterface | Master) {
    let contenedor = (entidad.nivel! + 1) * (entidad.nivel! + 1) * (entidad.nivel! + 1);
    if (barraExp != undefined) {
      return barraExp = { width: ((entidad.exp! * 100) / contenedor) + '%' };
    } else {
      return barraExp = { width: '0%' };
    }
  }

  public obtenerExpPokemon(pokeExp: PokemonInterface, pokeRival: PokemonInterface, barraExp?: any): PokemonInterface {
    let nivel: number = 0; let genero: string = ''; let exp: number = 0; let contExp: number = 0;
    this.contenedorExpPokemon = (pokeExp.nivel! + 1) * (pokeExp.nivel! + 1) * (pokeExp.nivel! + 1);
    // 1 seria 1.5 si fuera de un master
    pokeExp.exp! = this.convertirEntero((pokeExp.exp! + (250 * pokeRival.nivel!) / 7));

    do {
      pokeExp.nivel! += 1;
      pokeExp.exp! -= this.contenedorExpPokemon;
      if (barraExp != undefined) {
        barraExp = { width: ((pokeExp.exp! * 100) / this.contenedorExpPokemon) + '%' };
      }
      if (pokeExp.exp! < 0) { pokeExp.exp! = 0 }
      if (pokeExp.nivel_evolucion! <= pokeExp.nivel!) {
        if (pokeExp.nivel_evolucion! > 0) {
          nivel = pokeExp.nivel!; genero = pokeExp.genero; exp = pokeExp.exp!;
          pokeExp = this.evolucionar(pokeExp);
          pokeExp.nivel! = nivel; pokeExp.genero = genero; pokeExp.exp! = exp;
        }
      }
    } while (pokeExp.exp! >= this.contenedorExpPokemon);
    pokeExp = this.calcularStats(pokeExp);
    return pokeExp;
  }

  public obtenerExpMaster(master: Master, pokeSalvaje: PokemonInterface) {
    let contenedor = (master.nivel! + 1) * (master.nivel! + 1) * (master.nivel! + 1);
    let expGanada = 0;

    switch (pokeSalvaje.ball) {
      case 'pokeball':
        expGanada = this.getExpRelativa(master, contenedor, pokeSalvaje, 20, 18, 16, 10);
        break;
      case 'superball':
        expGanada = this.getExpRelativa(master, contenedor, pokeSalvaje, 14, 12, 10, 8);
        break;
      case 'ultraball':
        expGanada = this.getExpRelativa(master, contenedor, pokeSalvaje, 8, 4, 2, 1);
        break;
      case 'masterball':
        expGanada = this.getExpRelativa(master, contenedor, pokeSalvaje, 1, 1, 1, 1);
        break;
      default:
        expGanada = this.getExpRelativa(master, contenedor, pokeSalvaje, 15, 13, 11, 9);
        break;
    }

    master.exp! += expGanada;

    while (master.exp! >= contenedor) {
      master.nivel! += 1;
      master.exp! -= contenedor;
      contenedor = (master.nivel! + 1) * (master.nivel! + 1) * (master.nivel! + 1)
    }
    return master;
  }

  /**, y la devuelve
   */
  private getExpRelativa(master: Master, contenedor: number, pokeSalvaje: PokemonInterface, expEnorme: number, expGrande: number, expNormal: number, expPequeño: number) {
    let expGanada: number = 0;
    if (pokeSalvaje.nivel! > master.nivel!) {
      if (pokeSalvaje.hp > (pokeSalvaje.hp_max / 2)) {
        expGanada += (contenedor * (20 / 100));
      } else if (pokeSalvaje.hp > (pokeSalvaje.hp_max / 5)) {
        expGanada += (contenedor * (18 / 100));
      } else {
        expGanada += (contenedor * (16 / 100));
      }
    } else {
      expGanada += (contenedor * (15 / 100));
    }
    return expGanada;
  }

  public evolucionar(pokeEvo: PokemonInterface) {
    return this.stats.getStatsPokemon(pokeEvo.evolucion);
  }

  /**
   * Convierte un numero decimal a entero, (Muy útil debido a problemas con float).
   * 
   * @param numero Numero que se desea convertir a entero
   */
  public convertirEntero(numero: any) { numero = parseInt(numero + '', 10); return numero; }

  public nivelRango5(master: Master): number {
    let min: number; let max: number;

    if ((master.nivel! - 5) > 0) { min = (master.nivel! - 5); } else { min = 1; }
    max = master.nivel! + 5;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Calcula los parametros del pokemon en base a los siguientes requisitos:
   *  - Asegurarse de que se le pasa un objeto pokemon con nivel.
   *  - Asegurarse de que primero se le hace un getStatsPokemon() del servicio de estadísticas.
   * 
   * @param pokeRomo Pokemon sin atributos o que se quieren recalcular.
   */
  public calcularStats(pokeRomo: PokemonInterface) {
    let aux: number = (pokeRomo.IV + (pokeRomo.EV / 4) + 100);

    pokeRomo.hp_max = this.convertirEntero(((((2 * pokeRomo.hp_max + aux) * pokeRomo.nivel!) / 100) + 10));
    pokeRomo.hp = pokeRomo.hp_max;
    pokeRomo.ataque = this.convertirEntero(((((2 * pokeRomo.ataque + aux) * pokeRomo.nivel!) / 100) + 5));
    pokeRomo.defensa = this.convertirEntero(((((2 * pokeRomo.defensa + aux) * pokeRomo.nivel!) / 100) + 5));
    pokeRomo.ataque_especial = this.convertirEntero(((((2 * pokeRomo.ataque_especial + aux) * pokeRomo.nivel!) / 100) + 5));
    pokeRomo.defensa_especial = this.convertirEntero(((((2 * pokeRomo.defensa_especial + aux) * pokeRomo.nivel!) / 100) + 5));
    pokeRomo.velocidad = this.convertirEntero(((((2 * pokeRomo.velocidad + aux) * pokeRomo.nivel!) / 100) + 5));
    if ((Math.floor(Math.random() * (10 - 1 + 1)) + 1) <= 6) { pokeRomo.genero = 'hembra'; } else { pokeRomo.genero = 'macho'; }
    return pokeRomo;
  }

  public setCaracteristicas(master: Master ,pokemon: PokemonInterface) {
    let aux: number; let min: number; let max: number;

    if ((master.nivel! - 5) > 0) { min = (master.nivel! - 5); } else { min = 1; }
    max = master.nivel! + 5;
    pokemon.nivel! = Math.floor(Math.random() * (max - min + 1)) + min;
    pokemon.IV = 31; pokemon.EV = 252; aux = (pokemon.IV + (pokemon.EV / 4) + 100);

    pokemon.hp_max = this.convertirEntero(((((2 * pokemon.hp_max + aux) * pokemon.nivel!) / 100) + 10));
    pokemon.hp = pokemon.hp_max;
    pokemon.ataque = this.convertirEntero(((((2 * pokemon.ataque + aux) * pokemon.nivel!) / 100) + 5));
    pokemon.defensa = this.convertirEntero(((((2 * pokemon.defensa + aux) * pokemon.nivel!) / 100) + 5));
    pokemon.ataque_especial = this.convertirEntero(((((2 * pokemon.ataque_especial + aux) * pokemon.nivel!) / 100) + 5));
    pokemon.defensa_especial = this.convertirEntero(((((2 * pokemon.defensa_especial + aux) * pokemon.nivel!) / 100) + 5));
    pokemon.velocidad = this.convertirEntero(((((2 * pokemon.velocidad + aux) * pokemon.nivel!) / 100) + 5));
    if ((Math.floor(Math.random() * (10 - 1 + 1)) + 1) <= 8) { pokemon.genero = 'hembra'; } else { pokemon.genero = 'macho'; }
    return pokemon;
  }

}
