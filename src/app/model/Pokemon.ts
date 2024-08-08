/**
 * Parametros del pokemon
 */
export interface PokemonInterface {
    // Atributos principales
    numero_nacional: string;
    numero_regional: string;
    region: string;
    nombre: string;
    tipo_uno: string;
    tipo_dos: string;
    genero: string;
  
    // Nivel, Evo, Exp
    numero_evolucion: number;
    nivel_evolucion: number;
    evolucion: string;
    nivel?: number;
    exp?: number;
  
    // Puntos de Estado/Estadísticas
    hp: number;
    hp_max: number;
    ataque: number;
    defensa: number;
    ataque_especial: number;
    defensa_especial: number;
    velocidad: number;
    estado: string;
    IV: number;
    EV: number;
  
    ball: string;
    descripcion: string;
    favorito?: boolean;
}
