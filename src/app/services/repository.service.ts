import { Injectable } from '@angular/core';
import { UserData } from '../model/UserData';
import { StatsService } from './stats.service';
import { LvupService } from './lvup.service';
import { PokemonInterface } from '../model/Pokemon';
import { Master } from '../model/Master';
import { ConstantService } from './constant.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {
  private usuario: UserData;
  private master: Master;
  private regionActual: string;
  private atrapados: PokemonInterface[] = [];
  private pokedex: PokemonInterface[] = [];
  private equipoPokemon: PokemonInterface[] = [];
  private pokemonsRegionActual: PokemonInterface[] = [];

  constructor(private stats: StatsService, private constant: ConstantService) {
    this.usuario = { uid: '', email: '', photoURL: '', displayName: '' };
    this.master = this.constant.master_empty;
    this.regionActual = '';
    this.atrapados = [];
    this.equipoPokemon = [];
    this.pokemonsRegionActual = [];
    
    // let pokemon: PokemonInterface = this.poke.getStatsPokemon('252');
    // pokemon = this.lvup.setCaracteristicas(this.master, pokemon);
    // this.equipoPokemon.push(pokemon);

    // pokemon = this.poke.getStatsPokemon('255');
    // pokemon = this.lvup.setCaracteristicas(this.master, pokemon);
    // this.equipoPokemon.push(pokemon);

    // pokemon = this.poke.getStatsPokemon('258');
    // pokemon = this.lvup.setCaracteristicas(this.master, pokemon);
    // this.equipoPokemon.push(pokemon);

    // pokemon = this.poke.getStatsPokemon('341');
    // pokemon = this.lvup.setCaracteristicas(this.master, pokemon);
    // this.equipoPokemon.push(pokemon);

    // pokemon = this.poke.getStatsPokemon('360');
    // pokemon = this.lvup.setCaracteristicas(this.master, pokemon);
    // this.equipoPokemon.push(pokemon);

    // pokemon = this.poke.getStatsPokemon('361');
    // pokemon = this.lvup.setCaracteristicas(this.master, pokemon);
    // this.equipoPokemon.push(pokemon);
  }

  public modificarEquipoPokemon(poke: PokemonInterface, indice: number) {
    this.master.team[indice] = poke;
  }

  //////////////////  Master  /////////////////////////////

  public setMaster(master: Master): void {
    this.master = master;
    this.setAtrapados(master.capturados);
    this.setEquipoPokemon(master.team);
  }

  public getMaster(): Master {
    return this.master;
  }

  public getAtrapados(): PokemonInterface[] {
    return this.master.capturados;
  }

  public setAtrapados(atrapados: PokemonInterface[]): void {
    this.master.capturados = atrapados;
  }

  public getPokedex(): PokemonInterface[] {
    return this.pokedex;
  }

  public setPokedex(pokedex: PokemonInterface[]): void {
    this.pokedex = pokedex;
  }

  public getEquipoPokemon(): PokemonInterface[] {
    return this.master.team;
  }

  public setEquipoPokemon(equipoPokemon: PokemonInterface[]): void {
    this.master.team = equipoPokemon;
  }

  public updatePokemonBatalla(pokebatalla: PokemonInterface): PokemonInterface[] {
    // Filtrar Pokémon nulos o indefinidos
    let aux_team = this.master.team.filter(poke => poke !== null && poke !== undefined);

    // Actualizar el equipo con el Pokémon actualizado
    this.master.team = aux_team.map(poke => 
      poke.num_nation === pokebatalla.num_nation ? pokebatalla : poke
    );

    return this.master.team;
  }

  //////////////////////////////////////////////////////////
  //////////////////  Otros Datos  /////////////////////////

  public setRegion(region: string): void {
    this.regionActual = region;
  }

  public getRegion(): string {
    return this.regionActual;
  }

  public getPokemonsRegionActual(): PokemonInterface[] {
    return this.pokemonsRegionActual;
  }

  public setPokemonsRegionActual(pokemonsRegionActual: PokemonInterface[]): void {
    this.pokemonsRegionActual = pokemonsRegionActual;
  }

  public updatePokeRegionActual(poke: PokemonInterface) {
    let pokem: PokemonInterface = this.constant.poke_empty;

    this.pokemonsRegionActual.forEach(element => {
      if (poke.num_nation === element.num_nation) { pokem = element; }
    });

    let index = this.pokemonsRegionActual.indexOf(pokem);
    this.pokemonsRegionActual[index] = poke;

    return false;
  }

  public async getListaPokemonRegion(region: string): Promise<PokemonInterface[]> {
    console.log('INI - repository - getListaPokemonRegion');
    
    let lista: PokemonInterface[] = []
    let listaCapturados: PokemonInterface[] = []
    let uniquePokemon: Map<string, PokemonInterface> = new Map<string, PokemonInterface>();
    let nation: string = '';
    let first_poke_region: number = 0;
    let last_poke_region: number = 0;

    switch (region.toLowerCase()) {
      case 'kanto':
          first_poke_region = 1;
          last_poke_region = 151;
          break;
      case 'johto':
          first_poke_region = 152;
          last_poke_region = 251;
          break;
      case 'hoenn':
          first_poke_region = 252;
          last_poke_region = 386;
          break;
      case 'sinnoh':
          first_poke_region = 387;
          last_poke_region = 493;
          break;
      case 'unova':
          first_poke_region = 494;
          last_poke_region = 649;
          break;
      case 'kalos':
          first_poke_region = 650;
          last_poke_region = 721;
          break;
      case 'alola':
          first_poke_region = 722;
          last_poke_region = 809;
          break;
      case 'galar':
          first_poke_region = 810;
          last_poke_region = 898;
          break;
      case 'paldea':
          first_poke_region = 899;
          last_poke_region = 1010;
          break;
      default:
          throw new Error("Región no válida");
    }

    for (let index = first_poke_region; index < last_poke_region; index++) {
      // if (index < 10) {
      //   nation = '000' + index;
      // } else if (index >= 10 && index < 100) {
      //   nation = '00' + index;
      // } else if (index >= 100 && index < 1000) {
      //   nation = '0' + index;
      // } else {
      //   nation = '' + index;
      // }
      nation = index.toString().padStart(4, '0');

      // const aux_pokemon_species = `https://pokeapi.co/api/v2/pokemon-species/${ parseInt(nation) }/`;
      // const aux_pokemon = `https://pokeapi.co/api/v2/pokemon/${ parseInt(nation) }`;
      // const data = await this.stats.getExternalJson(aux_pokemon);
      // poke = await this.stats.getStatsPokemonV2(nation);
      let poke = this.stats.getStatsPokemon(this.constant.poke_empty, nation);

      if (region === poke.region) {
        listaCapturados = this.getPokedex();

        if (!uniquePokemon.has(poke.num_nation)) {
          // Clonar poke antes de asignarlo a uniquePokemon
          uniquePokemon.set(poke.num_nation, { ...poke });
        }

        listaCapturados.forEach(auxPoke => {
          if (auxPoke) {
            if (region === auxPoke.region && uniquePokemon.has(auxPoke.num_nation)) {
              // Clonar auxPoke antes de asignarlo a uniquePokemon
              uniquePokemon.get(auxPoke.num_nation)!.ball = auxPoke.ball;
            }
          }
        });

      }
    }

    // Convertir el objeto a un array para obtener la lista final
    uniquePokemon.forEach((pokemon, key) => {
      // Aquí puedes hacer lo que necesites con cada `pokemon`
      lista.push(pokemon);
    });

    // Aquí 'lista' tendrá solo los elementos únicos según 'num_nation'
    this.pokemonsRegionActual = lista;

    console.log('FIN - repository - getListaPokemonRegion');
    return lista;
  }

  public esFavorito(num_nation: string) {
    this.master.favoritos!.forEach((element: string) => {
      return num_nation === element ? true : false;
    });
  }

  //////////////////////////////////////////////////////////
  //////////////////  Usuario  /////////////////////////////

  public setUsuario(user: UserData) {
    this.usuario = user;
  }

  public getUsuario() {
    return this.usuario;
  }

  public setNick(nick: string) {
    this.usuario.displayName = nick;
  }

  public getNick() {
    return this.usuario.displayName;
  }

  public setAvatar(avatar: string) {
    this.usuario.photoURL = avatar;
  }

  public getAvatar() {
    return this.usuario.photoURL;
  }

  public getCorreo() {
    if (this.usuario ? true : false) {
      return this.usuario.email;
    } else {
      return null;
    }
  }

  public getNickCorto() {
    if (this.usuario ? true : false) {
      let cadena: string = this.usuario.displayName!;
      cadena = cadena.substring(0, cadena.indexOf(' '));
      return cadena;
    } else { return ''; }
  }

  //////////////////////////////////////////////////////////

  public evoEquipo(pokanterior: PokemonInterface, pokedespues: PokemonInterface) {
    const index = this.master.team.findIndex(poke => poke.num_nation === pokanterior.num_nation);
    if (index !== -1) {
      this.master.team[index] = pokedespues;
    }
  }

}
