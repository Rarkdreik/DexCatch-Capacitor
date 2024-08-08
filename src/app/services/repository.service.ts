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
  private atrapados: PokemonInterface[];
  private equipoPokemon: PokemonInterface[];
  private pokemonsRegionActual: PokemonInterface[];

  constructor(private stats: StatsService, private poke: StatsService, private lvup: LvupService, private constant: ConstantService) {
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
    this.equipoPokemon[indice] = poke;
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
    return this.atrapados;
  }

  public setAtrapados(atrapados: PokemonInterface[]): void {
    this.atrapados = atrapados;
  }

  public getEquipoPokemon(): PokemonInterface[] {
    return this.equipoPokemon;
  }

  public setEquipoPokemon(equipoPokemon: PokemonInterface[]): void {
    this.equipoPokemon = equipoPokemon;
  }

  public updatePokemonBatalla(pokebatalla: PokemonInterface): void {
    this.equipoPokemon.forEach((poke: PokemonInterface) => {
      if (poke.numero_nacional === pokebatalla.numero_nacional) { poke = pokebatalla; }
    })
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
      if (poke.numero_nacional === element.numero_nacional) { pokem = element; }
    });

    let index = this.pokemonsRegionActual.indexOf(pokem);
    this.pokemonsRegionActual[index] = poke;

    return false;
  }

  public async getListaPokemonRegion(region: string): Promise<PokemonInterface[]> {
    let lista: PokemonInterface[] = []
    let listaCapturados: PokemonInterface[] = []
    let poke: PokemonInterface;
    let nacional: string = '';
    let uniquePokemon: { [key: string]: PokemonInterface } = {};

    for (let index = 1; index < 807; index++) {
      if (index < 10) { 
        nacional = '00' + index; 
      } else if (index >= 10 && index < 100) { 
        nacional = '0' + index; 
      } else { 
        nacional = '' + index; 
      }

      poke = this.stats.getStatsPokemon(nacional);

      if (region === poke.region) {
        listaCapturados = this.getAtrapados();

        listaCapturados.forEach(auxPoke => {
          uniquePokemon[auxPoke.numero_nacional] = auxPoke;
        });

        if (!uniquePokemon[poke.numero_nacional]) {
          uniquePokemon[poke.numero_nacional] = poke;
        }
      }
    }

    // Convertir el objeto a un array para obtener la lista final
    for (const key in uniquePokemon) {
      lista.push(uniquePokemon[key]);
    }

    // Aquí 'lista' tendrá solo los elementos únicos según 'numero_nacional'
    this.pokemonsRegionActual = lista;
    return lista;
  }

  public esFavorito(numero_nacional: string) {
    this.master.favoritos!.forEach((element: string) => {
      return numero_nacional === element ? true : false;
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
    return this.usuario;

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

  public evoEquipo(pokanterior: PokemonInterface, pokespues: PokemonInterface) {
    this.equipoPokemon.forEach((poke) => {
      if (poke.numero_nacional === pokanterior.numero_nacional) {
        poke = pokespues;
      }
    });
  }

}
