import { Injectable } from '@angular/core';
import { EvolutionMethod, EvolutionType, PokemonInterface } from '../model/Pokemon';
import { Master } from '../model/Master';
import { UserData } from '../model/UserData';

@Injectable({
  providedIn: 'root'
})
export class ConstantService {

  constructor() { }

  public user_empty: UserData = { uid: '', displayName: '', email: '', photoURL: '', password: '' };
  private evo_type_lv_up: EvolutionType = EvolutionType.LEVEL_UP;
  private evo_method: EvolutionMethod = {
    type: this.evo_type_lv_up,
    level: 16, item: '',
    friendship: 0,
    timeOfDay: 'day' /*'night'*/,
    location: '',
    moveName: '',
    trade: false,
    otherPokemon: '', // Para evoes que requieren otro Pokémon en el equipo
  };

  public poke_empty: PokemonInterface = { num_nation: '', num_region: '', region: '', name: '', tipo_uno: 'vacio', tipo_dos: 'vacio',
                                          genero: 'female', level: 1, exp: 0, exp_max: 0, num_evo: 0, level_evo: 0, evo: '',
                                          happiness: 0, evolutionMethod: this.evo_method, evolutionCondition: '',
                                          hp: 0, hp_max: 0, attack: 0, defense: 0, special_attack: 0, special_defense: 0, speed: 0,
                                          state: 'nada', IV: 31, EV: 252, ball: '', descripcion: ''
                                        };

  public pokes_empty: PokemonInterface[] = [];
  public master_empty: Master = { nick: '', level: 1, exp: 0, pokeBalls: 5, superBalls: 0, ultraBalls: 0, masterBalls: 0, region_ini: '', poke_ini: this.poke_empty, capturados: this.pokes_empty, team: this.pokes_empty, favoritos: [] };
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
