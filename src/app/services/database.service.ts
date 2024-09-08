import { Injectable } from '@angular/core';
import { PokemonInterface } from '../model/Pokemon';
// import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
// import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { Master } from '../model/Master';
import { Platform } from '@ionic/angular';
// import { HttpClient } from '@angular/common/http';
import { StatsService } from './stats.service';
import { AlertsService } from './alerta.service';
import { ConstantService } from './constant.service';
import { environment } from 'src/environments/environment';

interface ssubjects {
  [key: string]: BehaviorSubject<PokemonInterface[]>;
};

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  // private database!: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private pokemonSubjects: ssubjects = {
    'kanto': new BehaviorSubject<PokemonInterface[]>([]),
    'johto': new BehaviorSubject<PokemonInterface[]>([]),
    'hoenn': new BehaviorSubject<PokemonInterface[]>([]),
    'sinnoh': new BehaviorSubject<PokemonInterface[]>([]),
    'unova': new BehaviorSubject<PokemonInterface[]>([]),
    'kalos': new BehaviorSubject<PokemonInterface[]>([]),
    'alola': new BehaviorSubject<PokemonInterface[]>([])
  };

  private pokemonCapturados = new BehaviorSubject<PokemonInterface[]>([]);
  private equipoPokemon = new BehaviorSubject<PokemonInterface[]>([]);
  private MasterDB = new BehaviorSubject<Master[]>([]);
  private entrenador: Master = this.constants.master_empty;
  private num_nation: string = '';

  constructor(
    private plt: Platform,
    // private sqlitePorter: SQLitePorter,
    // private sqlite: SQLite,
    // private http: HttpClient,
    private poke: StatsService,
    private alerta: AlertsService,
    private constants: ConstantService
  ) {
    this.plt.ready().then(() => {
      this.initializeDatabase();
    });
  }

  private async initializeDatabase() {
    // await this.sqlite.create({ name: 'pokedex.db', location: 'default' })
    //   .then(async (db: SQLiteObject) => {
    //     this.database = db;
    //     await this.seedDatabase();
    //   })
    //   .catch((error) => {
    //     this.alerta.alertaSimple('Error de Sqlite', 'No se ha podido crear la base de datos.', 'error');
    //     console.error(error);
    //   })
    // ;
  }

  private async seedDatabase() {
    // try {
    //   this.http.get('../../../assets/sqlquery/sqlTablasPokedex.sql', { responseType: 'text' })
    //   .subscribe(async (sql: any) => {
    //     console.log('base de datos 2');
    //     await this.sqlitePorter.importSqlToDb(this.database, sql)
    //       .then(async () => {
    //         // await this.database.executeSql(`SELECT * FROM kanto`, []).then((data: any) => { if (data.rows.length < 2) { this.addPokemonBD(); } });
    //         // this.loadPokemon('kanto');
    //         // this.loadPokemon('johto');
    //         // this.loadPokemon('hoenn');

    //         const data = await this.database.executeSql(`SELECT * FROM kanto`, []);
    //         if (data.rows.length < 2) { 
    //           await this.addPokemonBD(); 
    //         }

    //         this.loadPokemonEquipo();
    //         this.loadEntrenador();
    //         this.loadPokemonAtrapado();
    //         // await this.loadAllData();
    //         this.dbReady.next(true);
    //       })
    //       .catch((e: any) => console.error(e));
    //   });      

    // } catch (error) {
    //   console.error(error);
    // }
  }

  getDatabaseState(): Observable<boolean> {
    return this.dbReady.asObservable();
  }

  public async loadAllData() {
    this.loadEntrenador();
    ['kanto', 'johto', 'hoenn'].forEach(region => this.loadPokemon(region));
    this.loadPokemonEquipo();
    this.loadPokemonAtrapado();
  }

  public async loadEntrenador() {
    // this.database.executeSql(`SELECT * FROM entrenador`, []).then((data: any) => {
    //   let master: Master[] = [];

    //   if (data.rows.length > 0) {
    //     for (let i = 0; i < data.rows.length; i++) {
    //       master.push({
    //         nick: data.rows.item(i).nick, exp: data.rows.item(i).exp, level: data.rows.item(i).level, pokeBalls: data.rows.item(i).pokeBalls,
    //         superBalls: data.rows.item(i).superBalls, ultraBalls: data.rows.item(i).ultraBalls, masterBalls: data.rows.item(i).masterBalls,
    //         region_ini: data.rows.item(i).region_ini, poke_ini: data.rows.item(i).poke_ini, capturados: data.rows.item(i).capturados, favoritos: data.rows.item(i).favoritos
    //       });
    //     }
    //   }

    //   this.MasterDB.next(master);
    // });
  }

  public async addEntrenador(entrenador: Master) {
    let data = Object.values(entrenador);

    // return this.database.executeSql(`INSERT or IGNORE INTO entrenador VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, data).then(() => {
    //   this.loadEntrenador();
    // });
  }

  public async getEntrenadorPromise(entrenador: Master): Promise<Master> {
    // return this.database.executeSql(`SELECT * FROM entrenador WHERE nick = ?`, [entrenador.nick]).then((data: any) => {
    //   return {
    //     nick: data.rows.item(0).nick, exp: data.rows.item(0).exp, level: data.rows.item(0).level, pokeBalls: data.rows.item(0).pokeBalls,
    //     superBalls: data.rows.item(0).superBalls, ultraBalls: data.rows.item(0).ultraBalls, masterBalls: data.rows.item(0).masterBalls,
    //     region_ini: data.rows.item(0).region_ini, poke_ini: data.rows.item(0).poke_ini, capturados: data.rows.item(0).capturados, favoritos: data.rows.item(0).favoritos
    //   }
    // });

    return new Promise<Master>(() => this.constants.master_empty);
  }

  public async deleteEntrenador(entrenador: Master) {
    // return this.database.executeSql(`DELETE FROM entrenador WHERE nick = ?`, [entrenador.nick]).then(() => {
    //   this.loadEntrenador();
    // });
  }

  public async updateEntrenador(entrenador: Master) {
    // let data = [entrenador.nick];
    // return this.database.executeSql(`UPDATE entrenador SET porConstruir WHERE nick = ?`, data).then(() => {
    //   this.loadEntrenador();
    // });
  }

  public async loadPokemonAtrapado() {
    // this.database.executeSql(`SELECT * FROM atrapado`, []).then((data: any) => {
    //   let poke: PokemonInterface[] = [];

    //   if (data.rows.length > 0) {
    //     for (let i = 0; i < data.rows.length; i++) {
    //       poke.push({
    //         num_nation: data.rows.item(i).num_nation, num_region: data.rows.item(i).num_region, region: data.rows.item(i).region, name: data.rows.item(i).name, tipo_uno: data.rows.item(i).tipo_uno, tipo_dos: data.rows.item(i).tipo_dos,
    //         genero: data.rows.item(i).genero, descripcion: data.rows.item(i).descripcion, num_evo: data.rows.item(i).num_evo, level_evo: data.rows.item(i).level_evo, evo: data.rows.item(i).evo,
    //         level: data.rows.item(i).level, exp: data.rows.item(i).exp, hp: data.rows.item(i).hp, hp_max: data.rows.item(i).hp_max, attack: data.rows.item(i).attack, defense: data.rows.item(i).defense,
    //         special_attack: data.rows.item(i).special_attack, special_defense: data.rows.item(i).special_defense, speed: data.rows.item(i).speed, state: data.rows.item(i).state,
    //         IV: data.rows.item(i).IV, EV: data.rows.item(i).EV, ball: data.rows.item(i).ball
    //       });
    //     }
    //   }
    //   this.pokemonCapturados.next(poke);
    // });
  }

  public async addPokemonAtrapado(poke: PokemonInterface) {
    console.log('base de datos 10');
    let data = Object.values(poke);
    // return this.database.executeSql(environment.sql_insert + `atrapado` + environment.sql_poke_columnas, data).then((ok: any) => {
    //   this.loadPokemonAtrapado();
    // });
  }

  public async getPokemonAtrapado(poke: PokemonInterface): Promise<PokemonInterface> {
    console.log('base de datos 11');
    // return this.database.executeSql(`SELECT * FROM atrapado WHERE num_nation = ?`, [poke.num_nation]).then((data: any) => {
    //   return {
    //     num_nation: data.rows.item(0).num_nation, num_region: data.rows.item(0).num_region, region: data.rows.item(0).region, name: data.rows.item(0).name, tipo_uno: data.rows.item(0).tipo_uno, tipo_dos: data.rows.item(0).tipo_dos,
    //     genero: data.rows.item(0).genero, descripcion: data.rows.item(0).descripcion, num_evo: data.rows.item(0).num_evo, level_evo: data.rows.item(0).level_evo, evo: data.rows.item(0).evo,
    //     level: (data.rows.item(0).level !== undefined ? data.rows.item(0).level : ''), exp: (data.rows.item(0).exp !== undefined ? data.rows.item(0).exp : ''),

    //     hp: (data.rows.item(0).hp !== undefined ? data.rows.item(0).hp : ''), hp_max: (data.rows.item(0).hp_max !== undefined ? data.rows.item(0).hp_max : ''),
    //     attack: (data.rows.item(0).attack !== undefined ? data.rows.item(0).attack : ''), defense: (data.rows.item(0).defense !== undefined ? data.rows.item(0).defense : ''),
    //     special_attack: (data.rows.item(0).special_attack !== undefined ? data.rows.item(0).special_attack : ''), special_defense: (data.rows.item(0).special_defense !== undefined ? data.rows.item(0).special_defense : ''),
    //     speed: (data.rows.item(0).speed !== undefined ? data.rows.item(0).speed : ''), state: (data.rows.item(0).state !== undefined ? data.rows.item(0).state : ''),
    //     IV: (data.rows.item(0).IV !== undefined ? data.rows.item(0).IV : ''), EV: (data.rows.item(0).EV !== undefined ? data.rows.item(0).EV : ''), capturado: (data.rows.item(0).capturado !== undefined ? data.rows.item(0).capturado : ''), favorito: (data.rows.item(0).favorito !== undefined ? data.rows.item(0).favorito : ''),
    //     ball: (data.rows.item(0).ball !== undefined ? data.rows.item(0).ball : '')
    //   }
    // });

    return new Promise<PokemonInterface>(() => this.constants.poke_empty);
  }

  public async deletePokemonAtrapado(poke: PokemonInterface) {
    console.log('base de datos 12');
    // return this.database.executeSql(`DELETE FROM atrapado WHERE num_nation = ${poke.num_nation}`).then(() => {
    //   this.loadPokemon(poke.region);
    // });
  }

  public async updatePokemonAtrapado(poke: PokemonInterface) {
    console.log('base de datos 13');
    // let data = [poke.num_nation, , poke.num_region];
    // return this.database.executeSql(`UPDATE atrapado SET porConstruir WHERE num_nation = ${poke.num_nation}`, data).then((data: any) => {
    //   this.loadPokemon(poke.region);
    // })
  }


  /*************************************************
  **************** EQUIPO  POKEMON *****************
  *************************************************/

  public async loadPokemonEquipo() {
    console.log('base de datos 14');
    // return this.database.executeSql(`SELECT * FROM equipo`, []).then((data: any) => {
    //   let poke: PokemonInterface[] = [];

    //   if (data.rows.length > 0) {
    //     for (let i = 0; i < data.rows.length; i++) {

    //       poke.push({
    //         num_nation: data.rows.item(i).num_nation, num_region: data.rows.item(i).num_region, region: data.rows.item(i).region, name: data.rows.item(i).name, tipo_uno: data.rows.item(i).tipo_uno, tipo_dos: data.rows.item(i).tipo_dos,
    //         genero: data.rows.item(i).genero, descripcion: data.rows.item(i).descripcion, num_evo: data.rows.item(i).num_evo, level_evo: data.rows.item(i).level_evo, evo: data.rows.item(i).evo,
    //         level: data.rows.item(i).level, exp: data.rows.item(i).exp, hp: data.rows.item(i).hp, hp_max: data.rows.item(i).hp_max, attack: data.rows.item(i).attack, defense: data.rows.item(i).defense,
    //         special_attack: data.rows.item(i).special_attack, special_defense: data.rows.item(i).special_defense, speed: data.rows.item(i).speed, state: data.rows.item(i).state,
    //         IV: data.rows.item(i).IV, EV: data.rows.item(i).EV, ball: data.rows.item(i).ball
    //       });
    //     }
    //   }
    //   this.equipoPokemon.next(poke);
    // });
  }

  public async addPokemonEquipo(poke: PokemonInterface) {
    console.log('base de datos 15');
    // this.equipoPokemon.subscribe((pokemons) => {
    //   if (pokemons.length <= 6) {
    //     let data = Object.values(poke);
    //     return this.database.executeSql(environment.sql_insert + `equipo` + environment.sql_poke_columnas, data).then((data: any) => {
    //       this.loadPokemonEquipo();
    //     });
    //   } else {
    //     return this.constants.poke_empty;
    //   }
    // });
  }

  public async getPokemonEquipo(poke: PokemonInterface): Promise<PokemonInterface> {
    // return this.database.executeSql(`SELECT * FROM equipo WHERE num_nation = ?`, [poke.num_nation]).then((data: any) => {
    //   return {
    //     num_nation: data.rows.item(0).num_nation, num_region: data.rows.item(0).num_region, region: data.rows.item(0).region, name: data.rows.item(0).name, tipo_uno: data.rows.item(0).tipo_uno, tipo_dos: data.rows.item(0).tipo_dos,
    //     genero: data.rows.item(0).genero, descripcion: data.rows.item(0).descripcion, num_evo: data.rows.item(0).num_evo, level_evo: data.rows.item(0).level_evo, evo: data.rows.item(0).evo,
    //     level: (data.rows.item(0).level !== undefined ? data.rows.item(0).level : ''), exp: (data.rows.item(0).exp !== undefined ? data.rows.item(0).exp : ''),

    //     hp: (data.rows.item(0).hp !== undefined ? data.rows.item(0).hp : ''), hp_max: (data.rows.item(0).hp_max !== undefined ? data.rows.item(0).hp_max : ''),
    //     attack: (data.rows.item(0).attack !== undefined ? data.rows.item(0).attack : ''), defense: (data.rows.item(0).defense !== undefined ? data.rows.item(0).defense : ''),
    //     special_attack: (data.rows.item(0).special_attack !== undefined ? data.rows.item(0).special_attack : ''), special_defense: (data.rows.item(0).special_defense !== undefined ? data.rows.item(0).special_defense : ''),
    //     speed: (data.rows.item(0).speed !== undefined ? data.rows.item(0).speed : ''), state: (data.rows.item(0).state !== undefined ? data.rows.item(0).state : ''),
    //     IV: (data.rows.item(0).IV !== undefined ? data.rows.item(0).IV : ''), EV: (data.rows.item(0).EV !== undefined ? data.rows.item(0).EV : ''), capturado: (data.rows.item(0).capturado !== undefined ? data.rows.item(0).capturado : ''), favorito: (data.rows.item(0).favorito !== undefined ? data.rows.item(0).favorito : ''),
    //     ball: (data.rows.item(0).ball !== undefined ? data.rows.item(0).ball : '')
    //   }
    // });

    return new Promise<PokemonInterface>(() => this.constants.poke_empty);
  }

  public async deletePokemonEquipo(poke: PokemonInterface) {
    // return this.database.executeSql(`DELETE FROM equipo WHERE num_nation = ?`, [poke.num_nation]).then(() => {
    //   this.loadPokemon(poke.region);
    // });
  }

  public async updatePokemonEquipo(poke: PokemonInterface) {
    let data = [poke.num_nation, , poke.num_region];
    // return this.database.executeSql(`UPDATE equipo SET porConstruir WHERE num_nation = ${poke.num_nation}`, data).then((data: any) => {
    //   this.loadPokemon(poke.region);
    // })
  }

  /*************************************************
  **************** Pokemon *************************
  *************************************************/

  private async loadPokemon(region: string) {
    // try {
    //   const data = await this.database.executeSql(`SELECT * FROM ${region}`, []);
    //   const poke = [];

    //   for (let i = 0; i < data.rows.length; i++) {
    //     poke.push(data.rows.item(i));
    //   }

    //   this.pokemonSubjects[region].next(poke);
    // } catch (error) {
    //   console.error(error);
    // }
  }

  public async addPokemon(poke: PokemonInterface) {
    let data = Object.values(poke);
    // return this.database.executeSql(environment.sql_insert + `${poke.region} ` + environment.sql_poke_columnas, data).then((data: any) => {
    //   this.loadPokemon(poke.region);
    // });
  }

  public async getPokemon(poke: PokemonInterface): Promise<PokemonInterface> {
    // return this.database.executeSql(`SELECT * FROM ${poke.region} WHERE num_nation = ?`, [poke.num_nation]).then((data: any) => {
    //   let pokemon: PokemonInterface;
    //   return pokemon = data.rows.item(0);
    //   // return {
    //   //   num_nation: data.rows.item(0).num_nation, num_region: data.rows.item(0).num_region, region: data.rows.item(0).region, name: data.rows.item(0).name, tipo_uno: data.rows.item(0).tipo_uno, tipo_dos: data.rows.item(0).tipo_dos,
    //   //   genero: data.rows.item(0).genero, descripcion: data.rows.item(0).descripcion, num_evo: data.rows.item(0).num_evo, level_evo: data.rows.item(0).level_evo, evo: data.rows.item(0).evo,
    //   //   level: (data.rows.item(0).level !== undefined ? data.rows.item(0).level : ''), exp: (data.rows.item(0).exp !== undefined ? data.rows.item(0).exp : ''),

    //   //   hp: (data.rows.item(0).hp !== undefined ? data.rows.item(0).hp : ''), hp_max: (data.rows.item(0).hp_max !== undefined ? data.rows.item(0).hp_max : ''),
    //   //   attack: (data.rows.item(0).attack !== undefined ? data.rows.item(0).attack : ''), defense: (data.rows.item(0).defense !== undefined ? data.rows.item(0).defense : ''),
    //   //   special_attack: (data.rows.item(0).special_attack !== undefined ? data.rows.item(0).special_attack : ''), special_defense: (data.rows.item(0).special_defense !== undefined ? data.rows.item(0).special_defense : ''),
    //   //   speed: (data.rows.item(0).speed !== undefined ? data.rows.item(0).speed : ''), state: (data.rows.item(0).state !== undefined ? data.rows.item(0).state : ''),
    //   //   IV: (data.rows.item(0).IV !== undefined ? data.rows.item(0).IV : ''), EV: (data.rows.item(0).EV !== undefined ? data.rows.item(0).EV : ''), capturado: (data.rows.item(0).capturado !== undefined ? data.rows.item(0).capturado : ''), favorito: (data.rows.item(0).favorito !== undefined ? data.rows.item(0).favorito : ''),
    //   //   ball: (data.rows.item(0).ball !== undefined ? data.rows.item(0).ball : '')
    //   // }
    // });

    return new Promise<PokemonInterface>(() => this.constants.poke_empty);
  }

  public async deletePokemon(poke: PokemonInterface) {
    // return this.database.executeSql(`DELETE FROM ${poke.region} WHERE num_nation = ?`, [poke.num_nation]).then(() => {
    //   this.loadPokemon(poke.region);
    // });
  }

  public async updatePokemon(poke: PokemonInterface) {
    let data = [poke.num_nation, , poke.num_region];
    // return this.database.executeSql(`UPDATE ${poke.region} SET porConstruir WHERE num_nation = ${poke.num_nation}`, data).then((data: any) => {
    //   this.loadPokemon(poke.region);
    // })
  }

  public getPokemonsAtrapados(): Observable<PokemonInterface[]> {
    return this.pokemonCapturados.asObservable();
  }

  public getPokemonsEquipo(): Observable<PokemonInterface[]> {
    return this.pokemonCapturados.asObservable();
  }

  public getPokemons(region: string): Observable<PokemonInterface[]> {
    if (!this.pokemonSubjects[region]) throw new Error('Region not supported');

    return this.pokemonSubjects[region].asObservable();
  }

  public async addPokemonBD() {
    // for (let i = 1; i < 806; i++) {
    //   let pokemon: PokemonInterface;
    //   let num: string;

    //   if (i < 10) {
    //     num = '00' + i;
    //     pokemon = await this.poke.getStatsPokemon(num);
    //     await this.addPokemon(pokemon);
    //   } else if (i >= 10 && i < 100) {
    //     num = '0' + i;
    //     pokemon = await this.poke.getStatsPokemon(num);
    //     await this.addPokemon(pokemon);
    //   } else if (i >= 100) {
    //     num = '' + i;
    //     pokemon = await this.poke.getStatsPokemon(num);
    //     await this.addPokemon(pokemon);
    //   }
    // }
  }

  public getnum_nation() {
    return this.num_nation;
  }

  public setnum_nation(num_nation: string) {
    this.num_nation = num_nation;
  }

  public getEntrenador() {
    return this.entrenador;
  }

  public setEntrenador(entrenador: Master) {
    this.entrenador = entrenador;
  }

}
