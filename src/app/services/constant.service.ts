import { Injectable } from '@angular/core';
import { PokemonInterface } from '../model/Pokemon';
import { Master } from '../model/Master';
import { UserData } from '../model/UserData';

@Injectable({
  providedIn: 'root'
})
export class ConstantService {

  constructor() { }

  public user_empty: UserData = { uid: '', displayName: '', email: '', photoURL: '', password: '' };
  public poke_empty: PokemonInterface = { numero_nacional: '', numero_regional: '', region: '', nombre: '', tipo_uno: '', tipo_dos: '', genero: '', nivel: 0, exp: 0, numero_evolucion: 0, nivel_evolucion: 0, evolucion: '', hp: 0, hp_max: 0, ataque: 0, defensa: 0, ataque_especial: 0, defensa_especial: 0, velocidad: 0, estado: '', IV: 0, EV: 0, ball: '', descripcion: '' };
  public pokes_empty: PokemonInterface[] = [];
  public master_empty: Master = { nick: '', nivel: 1, exp: 0, pokeBalls: 5, superBalls: 0, ultraBalls: 0, masterBalls: 0, region_ini: '', poke_ini: this.poke_empty, capturados: this.pokes_empty, team: this.pokes_empty, favoritos: [] };
  public masters_empty: Master[] = [];

  public pageLogin: string = 'Login';
  public pageIniRe: string = 'IniRe';
  public pageSignin: string = 'Signin';
  public pageHome: string = 'Home';
  public pageCatch: string = 'Catch';
  public pageZafari: string = 'Zafari';

  getPoke_Empty() {
    return this.poke_empty;
  }

}
