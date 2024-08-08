import { PokemonInterface } from "./Pokemon";

export interface Master {
    nick: string;
    nivel: number;
    exp: number;
    pokeBalls: number;
    superBalls: number;
    ultraBalls: number;
    masterBalls: number;

    // Region inicial del master
    region_ini: string;
    // Pokemon inicial del master
    poke_ini: PokemonInterface;
    // Array de los pokemons atrapados
    capturados: PokemonInterface[];
    // Array del numero nacional de cada pokemon
    favoritos: string[];
    // Array de los pokemons team
    team: PokemonInterface[];
}
