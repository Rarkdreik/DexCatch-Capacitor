import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { StatsService } from 'src/app/services/stats.service';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { ConstantService } from 'src/app/services/constant.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { addIcons } from 'ionicons';

import gsap from 'gsap';
import { formatNumber } from '@angular/common';
import { FirebaseService } from 'src/app/services/firebase.service';
import { GsapService } from 'src/app/services/gsap-service.service';
import { LvupService } from 'src/app/services/lvup.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-modal-description',
  templateUrl: './modal-description.page.html',
  styleUrls: ['./modal-description.page.scss'],
})
export class ModalDescriptionPage implements OnInit {
  region: string = '';
  // habitat: string = '';
  info: boolean = true;
  // Lo usamos para mostrar un cargando mientras se realiza la operación.
  num_nation: string = '001';
  evo: string = '001';
  genero: boolean = true;
  // pokemon: PokemonInterface;
  pokemon: PokemonInterface = this.constants.poke_empty;
  public species: string = 'Pokémon';
  public description: string = '';
  public img: string = '';

  poke_stats: any;
  evol_data: any;
  evol_subdata: any;

  constructor(
    private db: DatabaseService,
    public fire: FirebaseService,
    public gsap_service: GsapService,
    public loading_service: LoadingService,
    public lvup: LvupService,
    public repo: RepositoryService,
    private route: ActivatedRoute,
    private router: Router,
    private stats: StatsService,
    public constants: ConstantService
  ) {

    this.region = this.repo.getRegion();
    addIcons({ 'icon-ball': '../../../assets/icon/icon-ball.svg' });
    this.gsap_service.setRetrieve();
    this.gsap_service.setSpawn();

    this.num_nation = this.route.snapshot.paramMap.get('id')!;
    this.pokemon = this.stats.getStatsPokemon(this.pokemon, this.num_nation);

    this.poke_stats = [
      { label: 'HP',      value: this.pokemon.hp,               min: 1, low: 20, high: 100, optimum: 150, max: 255 },
      { label: 'Speed',   value: this.pokemon.speed,        min: 1, low: 20, high: 100, optimum: 150, max: 200 },
      { label: 'Attack',  value: this.pokemon.attack,           min: 1, low: 20, high: 100, optimum: 150, max: 195 },
      { label: 'Defense', value: this.pokemon.defense,          min: 1, low: 20, high: 100, optimum: 150, max: 255 },
      { label: 'Sp. Atk', value: this.pokemon.special_attack,  min: 1, low: 20, high: 100, optimum: 150, max: 195 },
      { label: 'Sp. Def', value: this.pokemon.special_defense, min: 1, low: 20, high: 100, optimum: 150, max: 250 }
    ];

    // RestTemplate restTemplate = new RestTemplate();
    // String result = restTemplate.getForObject(uri, String.class);
    // return result;

    // TimeSeriesDaily result = restTemplate.getForObject(uri, TimeSeriesDaily.class);
    

    // this.httpClient.get("https://pokeapi.co/api/v2/" + auxUrlTemplate ).subscribe(data => {
    //   console.log(data);
    //   // this.templateInJsonFormat = data;
    //   // this.result = this.templateInJsonFormat.phaseExecutions.PRE.map(x => x.phaseValue)
    //   // this.getTemplateFromSubscribe(this.templateInJsonFormat);
    // });

    if (Math.floor(Math.random() * (10 - 1 + 1)) + 1 <= 8) {
      this.pokemon.genero = 'hembra';
      this.genero = true;
    } else {
      this.pokemon.genero = 'macho';
      this.genero = false;
    }
  }

  public goMain() {
    this.router.navigate(['/home'], { replaceUrl: true });;
  }

  mostrarInfoPokemon() {
    this.info = !this.info;
  }

  extractIdFromUrl(url: string): string {
    return url.split('/').filter(part => part).pop() || '';
  }

  async ngOnInit() {
    this.pokemon = await this.stats.getStatsPokemonV2(this.num_nation, 'es');
    console.log({ ...this.pokemon });

    this.poke_stats = [
      { label: 'HP',      value: this.pokemon.hp,               min: 1, low: 20, high: 100, optimum: 150, max: 255 },
      { label: 'Speed',   value: this.pokemon.speed,        min: 1, low: 20, high: 100, optimum: 150, max: 200 },
      { label: 'Attack',  value: this.pokemon.attack,           min: 1, low: 20, high: 100, optimum: 150, max: 195 },
      { label: 'Defense', value: this.pokemon.defense,          min: 1, low: 20, high: 100, optimum: 150, max: 255 },
      { label: 'Sp. Atk', value: this.pokemon.special_attack,  min: 1, low: 20, high: 100, optimum: 150, max: 195 },
      { label: 'Sp. Def', value: this.pokemon.special_defense, min: 1, low: 20, high: 100, optimum: 150, max: 250 }
    ];

    const aux_pokemon_species = `https://pokeapi.co/api/v2/pokemon-species/${ parseInt(this.num_nation) }/`;
    // const aux_pokemon = `https://pokeapi.co/api/v2/pokemon/${ parseInt(this.num_nation) }`;
    let data = await this.stats.getExternalJson(aux_pokemon_species);
    let data_chain = await this.stats.getExternalJson(data.evolution_chain.url);

    // Extraer la cadena evolutiva completa
    this.evol_data = this.lvup.extractEvolutionChain(data_chain.chain);

    console.log({...this.evol_data});
    console.log(this.processEvolutionChain(this.evol_data));

    // Aplicar selectEvolutionDetail a cada nodo de la cadena evolutiva
    this.evol_data = this.processEvolutionChain(this.evol_data);
    this.evol_subdata = this.evol_data.evolves_to[0];

    console.log(this.evol_data);

    // try {
    //   let auxhabitat = await this.stats.getExternalJson(await data.habitat.url);
    //   this.habitat = await auxhabitat.names.filter((entry: any) => entry.language.name === 'es')[0].name;
    //   console.log(this.habitat);
    // } catch (error) {
    //   this.habitat = 'vacio';
    // }
  }

  // Método recursivo para aplicar selectEvolutionDetail en todos los niveles de la cadena evolutiva
  private processEvolutionChain(evolution: any): any {
    if (evolution.evolution_details && evolution.evolution_details.length > 0) {
      // Aplicar selectEvolutionDetail en el nodo actual
      evolution.evolution_details = this.selectEvolutionDetail(evolution.evolution_details);
    }
  
    // Si hay evoluciones adicionales, procesarlas recursivamente
    if (evolution.evolves_to && evolution.evolves_to.length > 0) {
      evolution.evolves_to = evolution.evolves_to.map((evo: any) => this.processEvolutionChain(evo));
    }
  
    return evolution; // Retorna el objeto modificado
  }

  // Método para seleccionar solo un evolution_detail basado en las reglas
  private selectEvolutionDetail(details: any[]): any[] {
    console.log(details);
    
    if (!details || details.length === 0) {
      return [];
    }

    // Buscar por min_level (diferente de null y undefined)
    const byMinLevel = details.find(detail => detail.min_level != null);
    console.log(byMinLevel);
    if (byMinLevel) {
      console.log(this.mapEvolutionDetail(byMinLevel));
      return [this.mapEvolutionDetail(byMinLevel)];
    }

    // Buscar por item
    const byItem = details.find(detail => detail.item);
    if (byItem) {
      return [this.mapEvolutionDetail(byItem)];
    }

    // Buscar por time_of_day
    const byTimeOfDay = details.find(detail => detail.time_of_day);
    if (byTimeOfDay) {
      return [this.mapEvolutionDetail(byTimeOfDay)];
    }

    // Si no se cumple ninguna de las condiciones, devuelve el primer detalle
    return [this.mapEvolutionDetail(details[0])];
  }

  // Método para mapear el evolution_detail
  private mapEvolutionDetail(detail: any): any {
    return {
      trigger: detail.trigger,
      min_level: detail.min_level || undefined,
      item: detail.item || undefined,
      held_item: detail.held_item || undefined,
      time_of_day: detail.time_of_day || undefined,
      location: detail.location || undefined,
      known_move_type: detail.known_move_type || undefined,
      min_happiness: detail.min_happiness || undefined,
    };
  }

  /**
   * ir a la pagina de captura con el pokemon seleccionado
   * o solo mostrar la Ball detrás. Si se mantiene, lo liberas
   * al capturarlo se añade con todas sus características a la base de datos
   */
  async capturar(num_nation: any, pokemox: number) {
    // this.repo.setnum_nation(numPoke);
    const master = await this.fire.getMaster();
    const levelMaster = master.level;
  
    // Mapa de leveles requeridos para cada tipo de Pokémon
    const requisitoslevel: { [key: number]: number | undefined } = {
      0: 20,
      1: undefined, // Sin restricción de level
      2: 10,
      3: 15
    };
  
    // Obtener el level requerido para el tipo de Pokémon
    const levelRequerido = requisitoslevel[pokemox];
  
    if (levelRequerido === undefined || levelMaster >= levelRequerido) {
      this.router.navigate(['captura/' + num_nation], { replaceUrl: true });
    } else {
      alert(`Necesitas llegar al level ${levelRequerido} para capturar a este pokemon`);
    }
  }

}
