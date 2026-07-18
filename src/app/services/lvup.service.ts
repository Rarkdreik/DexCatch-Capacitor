import { Injectable } from '@angular/core';
import { Master } from '../model/Master';
import { PokemonInterface } from '../model/Pokemon';
import { ItemInterface } from '../model/Item';
import { StatsService } from './stats.service';
import { ConstantService } from './constant.service';
import { RepositoryService } from './repository.service';
import { LoggerService } from './logger.service';

interface EvolutionDetails {
  trigger: string;
  min_level?: number;
  item?: string;
  held_item?: string;
  time_of_day?: string;
  location?: string;
  known_move_type?: string;
  known_move?: string;
  min_happiness?: number;
  min_affection?: number;
  min_beauty?: number;
  gender?: number;
  needs_overworld_rain?: boolean;
  party_species?: string;
  party_type?: string;
  relative_physical_stats?: number;
  turn_upside_down?: boolean;
}

interface Evolution {
  species_name: string;
  species_url: string;
  evolves_to: Evolution[];
  evolution_details: EvolutionDetails[];
}

export interface EvolutionItemResult {
  evolved: boolean;
  pokemon: PokemonInterface;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class LvupService {
  private contenedorExpPokemon: number = 0;

  constructor(private stats: StatsService, private constant: ConstantService, private repo: RepositoryService, private logger: LoggerService) { }

  public calcularBarraHpPokemon(barraHp: any, vida: number, vida_max: number) {
    if (barraHp != undefined) {
      return barraHp = { width: (vida / vida_max) * 100 + '%' };
    } else {
      return barraHp = { width: '0%' };
    }
  }

  public calcularBarraExp(barraExp: any, entidad: PokemonInterface | Master) {
    let contenedor = (entidad.level! + 1) * (entidad.level! + 1) * (entidad.level! + 1);

    if (barraExp != undefined) {
      return barraExp = { width: (entidad.exp! / contenedor) * 100 + '%' };
    } else {
      return barraExp = { width: '0%' };
    }
  }

  /**
   * Calcula la experiencia ganada por un Pokémon después de una batalla y ajusta su level si es necesario.
   * 
   * Este método toma como parámetros al Pokémon que gana experiencia (pokeExp), al Pokémon rival derrotado (pokeRival),
   * y opcionalmente un objeto para la barra de experiencia (barraExp). 
   * 
   * Funciona de la siguiente manera:
   * 1. Calcula la experiencia obtenida en función del level del Pokémon rival y se la suma al Pokémon que ganó la batalla.
   * 2. Recalcula la cantidad de experiencia necesaria para el próximo level (contExp) basado en la fórmula n^3, donde n es el level del Pokémon.
   * 3. Verifica si el Pokémon tiene suficiente experiencia para subir de level:
   *    - Si es así, incrementa el level del Pokémon, reduce la experiencia acumulada por la cantidad necesaria para subir de level.
   *    - Si no tiene suficiente experiencia para el siguiente level, sale del bucle.
   * 4. Repite el proceso mientras el Pokémon siga teniendo suficiente experiencia para subir más leveles.
   * 5. Si el Pokémon alcanza un level en el que debe evoar, el método llama a la función de evolución y actualiza 
   *    los valores pertinentes (level, género, experiencia) después de la evolución.
   * 6. Finalmente, se recalculan las estadísticas del Pokémon para reflejar el nuevo level.
   * 
   * @param {PokemonInterface} pokeExp - El Pokémon que gana experiencia.
   * @param {PokemonInterface} pokeRival - El Pokémon rival derrotado.
   * @returns {PokemonInterface} - El Pokémon actualizado con la nueva experiencia, level y posibles evoes.
   */
  public obtenerExpPokemon(pokeExp: PokemonInterface, level_rival: number): PokemonInterface {
    let level: number = 0;
    let genero: string = '';
    let exp: number = 0;
    let contExp: number = 0;

    // Calcular la experiencia obtenida al derrotar al rival
    pokeExp.exp! = this.convertirEntero(pokeExp.exp! + Math.floor((250 * level_rival) / 7));

    this.logger.verbose('LvupService.obtenerExpPokemon', 'Experiencia aplicada al Pokemon', { numNation: pokeExp.num_nation, name: pokeExp.name, exp: pokeExp.exp, level: pokeExp.level });

    do {
      // Recalcular la experiencia necesaria para el próximo level basado en el level actual
      contExp = Math.pow(pokeExp.level!, 3);

      // Comprobar si tiene suficiente experiencia para subir de level
      if (pokeExp.exp! >= contExp) {
        pokeExp.level! += 1;
        pokeExp.exp! -= contExp;

        // evoar si se cumple la condición
        if (pokeExp.level_evo! <= pokeExp.level! && pokeExp.level_evo! > 0) {
          level = pokeExp.level!;
          genero = pokeExp.genero;
          exp = pokeExp.exp!;
          pokeExp = this.evoar(pokeExp);
          pokeExp.level! = level;
          pokeExp.genero = genero;
          pokeExp.exp! = exp;
        }
      } else {
        break; // Si no tiene suficiente experiencia para el próximo level, salir del bucle
      }
    } while (pokeExp.exp! >= contExp);

    pokeExp = this.calcularStats(pokeExp); // Recalcular las estadísticas del Pokémon

    return pokeExp;
  }

  public obtenerExpMaster(master: Master, pokeSalvaje: PokemonInterface) {
    let contenedor = (master.level! + 1) * (master.level! + 1) * (master.level! + 1);
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
      master.level! += 1;
      master.exp! -= contenedor;
      contenedor = (master.level! + 1) * (master.level! + 1) * (master.level! + 1)
    }
    return master;
  }

  /**, y la devuelve
   */
  private getExpRelativa(master: Master, contenedor: number, pokeSalvaje: PokemonInterface, expEnorme: number, expGrande: number, expNormal: number, expPequeño: number) {
    let expGanada: number = 0;
    if (pokeSalvaje.level! > master.level!) {
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

  public evoar(pokeEvo: PokemonInterface): PokemonInterface {
    let poke: PokemonInterface = this.stats.getStatsPokemon(pokeEvo, pokeEvo.evo);
    return poke;
  }

  /**
   * Convierte un numero decimal a entero, (Muy útil debido a problemas con float).
   * 
   * @param numero Numero que se desea convertir a entero
   */
  public convertirEntero(numero: any) { numero = parseInt(numero + '', 10); return numero; }

  /**
   * Genera un level aleatorio para un enemigo basado en el level promedio del equipo y el level del Master.
   * 
   * Este método calcula un level aleatorio para un Pokémon enemigo dentro de un rango que depende del level
   * promedio del equipo del jugador y del level del Master. El objetivo es equilibrar los encuentros para que
   * no sean demasiado difíciles ni demasiado fáciles.
   * 
   * @param {Master} master - El Master o líder cuyo level determina el rango superior del enemigo.
   * @returns {number} - El level generado para el enemigo.
   */
  public levelRango5(master: Master): number {
    const levelEquipoPromedio = this.calcularlevelPromedioEquipo(master); // Calcula el level promedio del equipo

    // Determina el mínimo level posible, asegurando que no sea menor que 1
    let min = Math.max(1, levelEquipoPromedio - 5); 

    // Determina el level máximo, asegurando que no exceda el level del Master
    let max = Math.min(master.level!, levelEquipoPromedio + 2); 

    // Genera un level aleatorio dentro del rango definido
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Calcula el level promedio del equipo Pokémon del jugador.
   * 
   * Este método suma los leveles de todos los Pokémon en el equipo y luego divide por la cantidad de Pokémon
   * para obtener el promedio. Si el equipo está vacío, devuelve 1 para evitar errores en cálculos posteriores.
   * 
   * @returns {number} - El level promedio del equipo.
   */
  private calcularlevelPromedioEquipo(master: Master): number {
    // Filtrar los Pokémon nulos o indefinidos del equipo
    const aux_team = master.team.filter(poke => poke !== null && poke !== undefined);

    if (aux_team.length === 0) return 1; // Evita divisiones por 0 en caso de que el equipo esté vacío

    // Suma los leveles de todos los Pokémon en el equipo
    const totalleveles = aux_team.reduce((sum, poke) => sum + poke.level!, 0);

    // Calcula y devuelve el level promedio, redondeado hacia abajo
    return Math.floor(totalleveles / aux_team.length);
  }


  /**
   * Calcula los parametros del pokemon en base a los siguientes requisitos:
   *  - Asegurarse de que se le pasa un objeto pokemon con level.
   *  - Asegurarse de que primero se le hace un getStatsPokemon() del servicio de estadísticas.
   * 
   * @param pokeRomo Pokemon sin atributos o que se quieren recalcular.
   */
  public calcularStats(pokeRomo: PokemonInterface) {
    let aux: number = (pokeRomo.IV + (pokeRomo.EV / 4) + 100);

    pokeRomo.hp_max = this.convertirEntero(((((2 * pokeRomo.hp_max + aux) * pokeRomo.level!) / 100) + 10));
    pokeRomo.hp = pokeRomo.hp_max;
    pokeRomo.attack = this.convertirEntero(((((2 * pokeRomo.attack + aux) * pokeRomo.level!) / 100) + 5));
    pokeRomo.defense = this.convertirEntero(((((2 * pokeRomo.defense + aux) * pokeRomo.level!) / 100) + 5));
    pokeRomo.special_attack = this.convertirEntero(((((2 * pokeRomo.special_attack + aux) * pokeRomo.level!) / 100) + 5));
    pokeRomo.special_defense = this.convertirEntero(((((2 * pokeRomo.special_defense + aux) * pokeRomo.level!) / 100) + 5));
    pokeRomo.speed = this.convertirEntero(((((2 * pokeRomo.speed + aux) * pokeRomo.level!) / 100) + 5));
    if ((Math.floor(Math.random() * (10 - 1 + 1)) + 1) <= 6) { pokeRomo.genero = 'hembra'; } else { pokeRomo.genero = 'macho'; }
    return pokeRomo;
  }

  public setCaracteristicas(master: Master ,pokemon: PokemonInterface) {
    let aux: number; let min: number; let max: number;

    if ((master.level! - 5) > 0) { min = (master.level! - 5); } else { min = 1; }
    max = master.level! + 5;
    pokemon.level! = Math.floor(Math.random() * (max - min + 1)) + min;
    pokemon.IV = 31; pokemon.EV = 252; aux = (pokemon.IV + (pokemon.EV / 4) + 100);

    pokemon.hp_max = this.convertirEntero(((((2 * pokemon.hp_max + aux) * pokemon.level!) / 100) + 10));
    pokemon.hp = pokemon.hp_max;
    pokemon.attack = this.convertirEntero(((((2 * pokemon.attack + aux) * pokemon.level!) / 100) + 5));
    pokemon.defense = this.convertirEntero(((((2 * pokemon.defense + aux) * pokemon.level!) / 100) + 5));
    pokemon.special_attack = this.convertirEntero(((((2 * pokemon.special_attack + aux) * pokemon.level!) / 100) + 5));
    pokemon.special_defense = this.convertirEntero(((((2 * pokemon.special_defense + aux) * pokemon.level!) / 100) + 5));
    pokemon.speed = this.convertirEntero(((((2 * pokemon.speed + aux) * pokemon.level!) / 100) + 5));
    if ((Math.floor(Math.random() * (10 - 1 + 1)) + 1) <= 8) { pokemon.genero = 'hembra'; } else { pokemon.genero = 'macho'; }
    return pokemon;
  }

  public extractEvolutionChain(chain: any): Evolution {
    const evolution: Evolution = {
      species_name: chain.species.name,
      species_url: chain.species.url,
      evolves_to: [],
      evolution_details: chain.evolution_details.map((detail: any) => ({
        trigger: detail.trigger.name,
        min_level: detail.min_level,
        item: detail.item ? detail.item.name : undefined,
        held_item: detail.held_item ? detail.held_item.name : undefined,
        time_of_day: detail.time_of_day || undefined,
        location: detail.location ? detail.location.name : undefined,
        known_move_type: detail.known_move_type ? detail.known_move_type.name : undefined,
        known_move: detail.known_move ? detail.known_move.name : undefined,
        min_happiness: detail.min_happiness || undefined,
        min_affection: detail.min_affection || undefined,
        min_beauty: detail.min_beauty || undefined,
        gender: detail.gender ?? undefined,
        needs_overworld_rain: detail.needs_overworld_rain || undefined,
        party_species: detail.party_species ? detail.party_species.name : undefined,
        party_type: detail.party_type ? detail.party_type.name : undefined,
        relative_physical_stats: detail.relative_physical_stats ?? undefined,
        turn_upside_down: detail.turn_upside_down || undefined,
      })),
    };

    if (chain.evolves_to.length > 0) {
      evolution.evolves_to = chain.evolves_to.map((evo: any) => this.extractEvolutionChain(evo));
    }
  
    return evolution;
  }

  public async checkEvolutionConditions(pokemon: PokemonInterface): Promise<PokemonInterface> {
    const aux_pokemon_species = `https://pokeapi.co/api/v2/pokemon-species/${ parseInt(pokemon.num_nation) }/`;
    let data_species = await this.getExternalJson(aux_pokemon_species);
    let data_chain = await this.getExternalJson(data_species.evolution_chain.url);
    // pokemon-species/nation o name --> evolution_chain.url
    // let data_chain = await this.getExternalJson(data_species.evolution_chain.url);
    // data_chain.chain.evolves_to[0]

    // Extraer la cadena evolutiva completa
    const evolutionChain = this.extractEvolutionChain(data_chain.chain);
    this.logger.verbose('LvupService.checkEvolutionConditions', 'Cadena evolutiva calculada', evolutionChain);

    for (const evolution of evolutionChain.evolves_to) {
      for (const detail of evolution.evolution_details) {
        // Verificar condiciones como level mínimo, objeto necesario, hora del día, etc.
        const equippedItemName = pokemon.heldItem?.name;
        const meetsLevelCondition = !detail.min_level || pokemon.level! >= detail.min_level;
        const meetsItemCondition = !detail.item || equippedItemName === detail.item;
        const meetsHeldItemCondition = !detail.held_item || equippedItemName === detail.held_item;
        const meetsTimeOfDayCondition = !detail.time_of_day || this.checkTimeOfDay(detail.time_of_day);
        // const meetsLocationCondition = !detail.location || this.repo.getRegion() === detail.location;
        const meetsLocationCondition = true;
        const meetsHappinessCondition = !detail.min_happiness || pokemon.happiness! >= detail.min_happiness;

        // Si todas las condiciones se cumplen, actualizar el Pokémon
        if (meetsLevelCondition && meetsItemCondition && meetsHeldItemCondition && meetsTimeOfDayCondition && meetsLocationCondition && meetsHappinessCondition) {
          return this.evolvePokemon(pokemon, evolution.species_name, evolution.species_url);
        }
      }
    }

    return pokemon; // Si no cumple las condiciones, retornar el Pokémon sin cambios
  }

  public async useEvolutionItem(pokemon: PokemonInterface, item: ItemInterface): Promise<EvolutionItemResult> {
    const itemName = this.normalizeEvolutionName(item.name);
    const auxPokemonSpecies = `https://pokeapi.co/api/v2/pokemon-species/${parseInt(pokemon.num_nation, 10)}/`;
    const dataSpecies = await this.getExternalJson(auxPokemonSpecies);
    const dataChain = await this.getExternalJson(dataSpecies.evolution_chain.url);
    const evolutionChain = this.extractEvolutionChain(dataChain.chain);
    const currentEvolution = this.findEvolutionNode(evolutionChain, pokemon);

    this.logger.verbose('LvupService.useEvolutionItem', 'Cadena evolutiva calculada para item', { pokemon: pokemon.name, item: item.name, evolutionChain });

    if (!currentEvolution) {
      return {
        evolved: false,
        pokemon,
        message: `No se ha encontrado la evolucion de ${pokemon.name}.`,
      };
    }

    let blockedMessage = '';

    for (const evolution of currentEvolution.evolves_to) {
      for (const detail of evolution.evolution_details) {
        if (!detail.item || this.normalizeEvolutionName(detail.item) !== itemName) {
          continue;
        }

        const unmetConditions = this.getUnmetEvolutionConditions(pokemon, detail);

        if (unmetConditions.length > 0) {
          blockedMessage = `${pokemon.name} necesita ${unmetConditions.join(', ')} para evolucionar con ${item.display_name || item.name}.`;
          continue;
        }

        const previousName = pokemon.name;
        this.evolvePokemon(pokemon, evolution.species_name, evolution.species_url);
        await this.hydrateEvolutionMetadata(pokemon, pokemon.num_nation);

        return {
          evolved: true,
          pokemon,
          message: `${previousName} ha evolucionado a ${pokemon.name}.`,
        };
      }
    }

    return {
      evolved: false,
      pokemon,
      message: blockedMessage || `${item.display_name || item.name} no sirve para evolucionar a ${pokemon.name}.`,
    };
  }

  private findEvolutionNode(evolution: Evolution, pokemon: PokemonInterface): Evolution | null {
    const pokemonNationalId = this.normalizeNationalId(pokemon.num_nation);
    const evolutionNationalId = this.normalizeNationalId(this.getNumNationalOfUrl(evolution.species_url));

    if (evolutionNationalId === pokemonNationalId || this.normalizeEvolutionName(evolution.species_name) === this.normalizeEvolutionName(pokemon.name)) {
      return evolution;
    }

    for (const nextEvolution of evolution.evolves_to) {
      const match = this.findEvolutionNode(nextEvolution, pokemon);

      if (match) {
        return match;
      }
    }

    return null;
  }

  private getUnmetEvolutionConditions(pokemon: PokemonInterface, detail: EvolutionDetails): string[] {
    const unmetConditions: string[] = [];

    if (detail.min_level && (pokemon.level ?? 0) < detail.min_level) {
      unmetConditions.push(`nivel ${detail.min_level}`);
    }

    if (detail.held_item && this.normalizeEvolutionName(pokemon.heldItem?.name || '') !== this.normalizeEvolutionName(detail.held_item)) {
      unmetConditions.push(`llevar ${detail.held_item}`);
    }

    if (detail.time_of_day && !this.checkTimeOfDay(detail.time_of_day)) {
      unmetConditions.push(`hora ${detail.time_of_day}`);
    }

    if (detail.min_happiness && (pokemon.happiness ?? 0) < detail.min_happiness) {
      unmetConditions.push(`felicidad ${detail.min_happiness}`);
    }

    if (detail.gender && !this.checkGender(pokemon, detail.gender)) {
      unmetConditions.push(this.describeGender(detail.gender));
    }

    if (detail.min_affection) {
      unmetConditions.push(`afecto ${detail.min_affection}`);
    }

    if (detail.min_beauty) {
      unmetConditions.push(`belleza ${detail.min_beauty}`);
    }

    if (detail.known_move) {
      unmetConditions.push(`movimiento ${detail.known_move}`);
    }

    if (detail.known_move_type) {
      unmetConditions.push(`movimiento de tipo ${detail.known_move_type}`);
    }

    if (detail.location) {
      unmetConditions.push(`ubicacion ${detail.location}`);
    }

    if (detail.needs_overworld_rain) {
      unmetConditions.push('lluvia');
    }

    if (detail.party_species) {
      unmetConditions.push(`equipo con ${detail.party_species}`);
    }

    if (detail.party_type) {
      unmetConditions.push(`equipo con tipo ${detail.party_type}`);
    }

    if (detail.relative_physical_stats !== undefined) {
      unmetConditions.push('condicion de ataque/defensa');
    }

    if (detail.turn_upside_down) {
      unmetConditions.push('consola boca abajo');
    }

    return unmetConditions;
  }

  private checkGender(pokemon: PokemonInterface, requiredGender: number): boolean {
    const gender = (pokemon.genero || '').toLowerCase();

    if (requiredGender === 1) {
      return gender === 'hembra';
    }

    if (requiredGender === 2) {
      return gender === 'macho';
    }

    return true;
  }

  private describeGender(requiredGender: number): string {
    if (requiredGender === 1) {
      return 'ser hembra';
    }

    if (requiredGender === 2) {
      return 'ser macho';
    }

    return 'genero compatible';
  }

  private normalizeEvolutionName(value: string): string {
    return (value || '').toLowerCase().trim().replace(/\s+/g, '-');
  }

  private normalizeNationalId(value: string): string {
    return `${parseInt(value, 10)}`;
  }

  private updateStatsForEvolution(pokemon: PokemonInterface, targetNationalId: string): PokemonInterface {
    const previous = {
      level: pokemon.level,
      exp: pokemon.exp,
      genero: pokemon.genero,
      ball: pokemon.ball,
      heldItem: pokemon.heldItem,
      favorito: pokemon.favorito,
      happiness: pokemon.happiness,
      IV: pokemon.IV,
      EV: pokemon.EV,
      hpRatio: pokemon.hp_max > 0 ? pokemon.hp / pokemon.hp_max : 1,
    };
    const updatedStats = this.stats.getStatsPokemon({ ...this.constant.poke_empty }, targetNationalId.padStart(4, '0'));

    Object.assign(pokemon, updatedStats, {
      level: previous.level,
      exp: previous.exp,
      genero: previous.genero,
      ball: previous.ball,
      heldItem: previous.heldItem,
      favorito: previous.favorito,
      happiness: previous.happiness,
      IV: previous.IV,
      EV: previous.EV,
    });

    this.calcularStats(pokemon);
    pokemon.genero = previous.genero;
    pokemon.hp = previous.hpRatio <= 0 ? 0 : Math.max(1, Math.min(pokemon.hp_max, Math.floor(pokemon.hp_max * previous.hpRatio)));

    return pokemon;
  }

  private evolvePokemon(pokemon: PokemonInterface, speciesName: string, speciesUrl: string): PokemonInterface {
    const targetNationalId = this.getNumNationalOfUrl(speciesUrl).padStart(4, '0');
    this.updateStatsForEvolution(pokemon, targetNationalId);
    pokemon.name = pokemon.name || speciesName;
    pokemon.num_nation = targetNationalId;
    pokemon.img = this.getPokemonHomeImage(targetNationalId);

    this.logger.info('LvupService.evolvePokemon', 'Pokemon evolucionado', { name: pokemon.name, speciesName, numNation: pokemon.num_nation });
    return pokemon;
  }

  private getPokemonHomeImage(nationalId: string): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${parseInt(nationalId, 10)}.png`;
  }

  private async hydrateEvolutionMetadata(pokemon: PokemonInterface, targetNationalId: string, lang = 'es'): Promise<void> {
    const numericNationalId = parseInt(targetNationalId, 10);

    if (Number.isNaN(numericNationalId)) {
      return;
    }

    pokemon.img = this.getPokemonHomeImage(targetNationalId);

    try {
      const [pokemonData, speciesData] = await Promise.all([
        this.getExternalJson(`https://pokeapi.co/api/v2/pokemon/${numericNationalId}`),
        this.getExternalJson(`https://pokeapi.co/api/v2/pokemon-species/${numericNationalId}/`),
      ]);

      pokemon.height = pokemonData.height;
      pokemon.weight = pokemonData.weight;
      pokemon.base_experience = pokemonData.base_experience;
      pokemon.types = pokemonData.types;
      pokemon.descripcion = this.pickLocalizedText(speciesData.flavor_text_entries, lang, 'flavor_text');
      pokemon.specie = this.pickLocalizedText(speciesData.genera, lang, 'genus');
    } catch (error) {
      this.logger.warn('LvupService.hydrateEvolutionMetadata', 'No se pudo actualizar metadata del Pokemon evolucionado', { targetNationalId, error });
    }
  }

  private pickLocalizedText(entries: any[] | undefined, lang: string, field: string): string {
    if (!Array.isArray(entries)) {
      return '';
    }

    const entry = entries.find((value: any) => value.language?.name === lang) || entries[0];
    const text = entry?.[field];
    return typeof text === 'string' ? text.replace(/\n/g, ' ') : '';
  }

  private checkTimeOfDay(requiredTimeOfDay: string): boolean {
    const currentHour = new Date().getHours();
    if (requiredTimeOfDay === 'day') {
      return currentHour >= 6 && currentHour < 18; // De 6 AM a 6 PM
    } else if (requiredTimeOfDay === 'night') {
      return currentHour >= 18 || currentHour < 6; // De 6 PM a 6 AM
    } else if (requiredTimeOfDay === 'dusk') {
      return currentHour >= 17 && currentHour < 19; // Ejemplo de anochecer
    }
    return false;
  }

  private getNumNationalOfUrl(url: string) {
    const lastSlashIndex = url.lastIndexOf('/', url.length - 2);
    return url.substring(lastSlashIndex + 1, url.length - 1);
  }

  public async getExternalJson(url: string): Promise<any> {
    let rest = await fetch(url);
    return await rest.json();
  }

}
