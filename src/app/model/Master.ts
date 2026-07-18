import { PokemonInterface } from "./Pokemon";
import { ItemInterface } from "./Item";

export interface Master {
    nick: string;
    level: number;
    exp: number;

    // Region inicial del master
    region_ini: string;
    // Pokemon inicial del master
    poke_ini: PokemonInterface;
    // Array de los pokemons atrapados
    capturados: PokemonInterface[];
    // Array del numero nation de cada pokemon
    favoritos: string[];
    // Array de los pokemons team
    team: PokemonInterface[];
    money: number;
    items: ItemInterface[]
}
