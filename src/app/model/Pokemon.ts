/**
 * Parametros del pokemon
 */
export interface PokemonInterface {
    // Atributos principales
    num_nation: string;
    num_region: string;
    region: string;
    name: string;
    tipo_uno: string;
    tipo_dos: string;
    genero: string;
    specie?: string;
  
    // level, Evo, Exp
    num_evo: number;
    level_evo: number;
    evo: string;
    level?: number;
    exp?: number;
    exp_max?: number;
  
    // Puntos de state/Estadísticas
    hp: number;
    hp_max: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
    state: string;
    IV: number;
    EV: number;
  
    ball: string;
    descripcion: string;
    favorito?: boolean;
    
    height?: number;
    weight?: number;

    happiness?: number;
    evolutionMethod?: EvolutionMethod;
    evolutionCondition?: any; // para condiciones adicionales como hora del día, objeto, etc.

    item?: string;
    img?: string;
    types?: any;
    base_experience?: number;
}

export interface EvolutionMethod {
  type: EvolutionType;
  level?: number;
  item?: string;
  friendship?: number;
  timeOfDay?: 'day' | 'night';
  location?: string;
  moveName?: string;
  trade?: boolean;
  otherPokemon?: string; // Para evoes que requieren otro Pokémon en el equipo
}

export enum EvolutionType {
  LEVEL_UP,
  USE_ITEM,
  TRADE,
  FRIENDSHIP,
  SPECIAL_CONDITION
}
