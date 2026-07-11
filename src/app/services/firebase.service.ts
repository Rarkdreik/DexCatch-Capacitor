import { inject, Injectable } from '@angular/core';
import { Master } from '../model/Master';
import { QrcodeInterface } from '../model/Qrcode';
import { UserData } from '../model/UserData';
import { environment } from 'src/environments/environment';
import { RepositoryService } from './repository.service';
import { AlertsService } from './alerta.service';
import { ToastService } from './toast.service';
import { PokemonInterface } from '../model/Pokemon';

import { firstValueFrom, map, Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ConstantService } from './constant.service';
import { LocalDbService } from './local-db.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private catchdex_fb!: AngularFirestoreDocument<any>;
  private pokeCollection!: AngularFirestoreCollection<any>;
  private masterCollection!: AngularFirestoreCollection<Master>;
  private qrDocument!: AngularFirestoreDocument<QrcodeInterface>;
  private pokemon: PokemonInterface = this.constants.poke_empty;
  private master: Master = this.constants.master_empty;
  itemss$: Observable<any[]> | undefined;

  constructor(private af: AngularFirestore, private repo: RepositoryService, private alert: AlertsService, private toast: ToastService, private constants: ConstantService, private localDb: LocalDbService) { }

  public inicializar(correo: string) {
    this.catchdex_fb = this.af.collection(environment.id_app).doc(correo);
    this.pokeCollection = this.catchdex_fb.collection('pokedex');
    this.masterCollection = this.catchdex_fb.collection('master');
    this.qrDocument = this.af.collection(environment.id_app).doc('codigos');
    // this.add_datos();
    // this.addMaster(this.master);
  }

  /////////////////////////////////////////////////////////////
  //////////////////  Usuario  ////////////////////////////////
  /////////////////////////////////////////////////////////////

  public async getDatosUsuario(user: any): Promise<UserData> {
    console.log("INI - firebase.service - getDatosUsuario");
    this.inicializar(user.email!);
    let userRef: AngularFirestoreDocument<UserData> = this.af.collection(user.email!).doc('correo');
    let auxUser: UserData = this.constants.user_empty;

    auxUser = await userRef.ref.get().then(resultado => {
      let user: UserData = { uid: resultado.data()!.uid, email: resultado.data()!.email, photoURL: resultado.data()!.photoURL, displayName: resultado.data()!.displayName, };
      return user;
    }).catch(async (erroneo) => {
      console.error(erroneo);
      return auxUser;
    });

    this.repo.setUsuario(auxUser);
    await this.localDb.setUser(auxUser);
    this.master = await this.getMaster();
    this.repo.setMaster(this.master);
    this.repo.setRegion(this.master.region_ini);
    console.log("FIN - firebase.service - getDatosUsuario");
    return auxUser;
  }

  /**
   *
   * @param user qwerty
   */
  public setDatosUsuario(user: any): UserData {
    console.log("INI - firebase.service - setDatosUsuario");
    console.log(user.email!);
    const userRef: AngularFirestoreDocument<UserData> = this.af.collection(user.email!).doc('correo');
    const auxUser: UserData = {
      uid: user.uid ?? '',
      email: user.email,
      photoURL: user.photoURL || 'assets/images/avatar/avatar.png',
      displayName: user.displayName || '',
    };

    userRef.set(auxUser, { merge: true });
    this.repo.setUsuario(auxUser);
    void this.localDb.setUser(auxUser);

    console.log(auxUser);
    console.log("FIN - firebase.service - setDatosUsuario");
    return auxUser;
  }

  /**
   *
   * @param user qwerty
   */
  public async updateUserData(user: { email?: string | null; uid?: string | null; photoURL?: string | null; displayName?: string | null }): Promise<UserData> {
    console.log("INI - firebase.service - updateUserData");
    console.log(user);

    if (!user.email) {
      throw new Error('No hay email de usuario para actualizar sus datos.');
    }

    const userRef: AngularFirestoreDocument<UserData> = this.af.collection(user.email).doc('correo');
    const auxUser: UserData = {
      uid: user.uid ?? '',
      email: user.email,
      photoURL: user.photoURL || 'assets/images/avatar/avatar.png',
      displayName: user.displayName || '',
    };

    await userRef.set(auxUser, { merge: true });
    this.repo.setUsuario(auxUser);
    await this.localDb.setUser(auxUser);

    console.log("FIN - firebase.service - updateUserData");
    return auxUser;
  }

  public deleteUser(user: UserData) {
    const userRef: AngularFirestoreDocument<UserData> = this.af.collection(user.email).doc('correo');
    return userRef.delete();
  }

  public setDisplayName(name: string) {
    const usuario = { ...this.repo.getUsuario(), displayName: name };
    void this.updateUserData(usuario);
  }

  /////////////////////////////////////////////////////////////
  //////////////////  Codigo Qr  //////////////////////////////
  /////////////////////////////////////////////////////////////

  /**
   * 
   * @param correo 
   * @param codigo 
   * @param uso 
   * @param tiempo 
   */
  public async crearQr(codigoQr: QrcodeInterface) {
    console.log("INI - firebase.service - crearQr");
    console.log(codigoQr);
    this.leerQr(codigoQr).then((resultado) => {}).catch((erroneo) => {
      this.toast.presentarToast('No se ha podido crear el codigo qr. ' + erroneo, 'warning', 3000)
    });
    const qrRef = this.af.collection(environment.id_app).doc('codigos').collection('qr').doc<QrcodeInterface>(codigoQr.correo);

    const data: QrcodeInterface = { codigo: codigoQr.codigo, correo: codigoQr.correo, usos: codigoQr.usos };

    await qrRef.set(data);
    console.log("FIN - firebase.service - crearQr");
  }

  private async leerQr(codigoQr: QrcodeInterface) {
    console.log("INI - firebase.service - leerQr");
    const qrRef = this.af.collection(environment.id_app).doc('codigos').collection('qr').doc<QrcodeInterface>(codigoQr.correo);

    return new Promise(async (resolve, reject) => {
      await qrRef.ref.get().then(resultado => {
        const qr: QrcodeInterface = { codigo: resultado.data()!.codigo, correo: resultado.data()!.correo, usos: resultado.data()!.usos, };
        resolve(qr);

      }).catch(async (erroneo) => {
        // this.toast.cerrarToast();
        this.toast.presentarToast('No se ha podido leer el codigo qr. ' + erroneo, 'warning', 3000)//.then(() => { reject(null); });
      });
      console.log("FIN - firebase.service - leerQr");
    });
  }

  public async actualizarQr(codigoQr: QrcodeInterface) {
    const qrRef = this.af.collection(environment.id_app).doc('codigos').collection('qr').doc<QrcodeInterface>(codigoQr.correo);

    return await qrRef.update(codigoQr).then(() => {
      this.toast.presentarToast('Codigo qr actualizado.', 'warning', 3000);
    }).catch(async (erroneo) => {
      this.toast.cerrarToast();
      this.toast.presentarToast('No se ha podido actualizar el codigo qr. ' + erroneo, 'warning', 3000);
    });
  }

  public async deleteQr(correo: string) {
    const qrRef = this.af.collection(environment.id_app).doc('codigos').collection('qr').doc<QrcodeInterface>(correo);
    return await qrRef.delete();
  }

  public async prueba(codigo: string) {
    let codigosQrRef = this.af.collection(environment.id_app).doc('codigos').collection('qr').ref;

    let query = await codigosQrRef.get().then(async snapshot => {
      if (snapshot.empty) {
        this.toast.presentarToast('No existen codigos Qr', 'danger', 3000);
        return;
      }

      snapshot.forEach(async doc => {
        if (codigo === doc.data()['codigo']) {
          if (doc.data()['usos'] >= 1) {
            let codeQr = doc.data() as QrcodeInterface;
            let pokeMaestro = this.repo.getMaster();
            pokeMaestro.pokeBalls += 5;
            pokeMaestro.superBalls += 3;
            pokeMaestro.ultraBalls += 2;
            pokeMaestro.masterBalls += 1;

            if (pokeMaestro.favoritos == undefined) { pokeMaestro.favoritos = []; }

            this.repo.setMaster(pokeMaestro);
            await this.addMaster(pokeMaestro);

            this.toast.presentarToast('Has conseguido:' +
              '\n\tx' + pokeMaestro.pokeBalls + ' pokeballs' +
              '\n\tx' + pokeMaestro.superBalls + ' Superballs' +
              '\n\tx' + pokeMaestro.ultraBalls + ' Ultraballs' +
              '\n\tx' + pokeMaestro.masterBalls + ' Masterballs',
              'success', 5000
            );

            codeQr.usos -= 1;
            this.actualizarQr(codeQr);
          } else {
            this.toast.cerrarToast();
            this.toast.presentarToast('Ya no se puede usar este codigo qr', 'warning', 5000);
          }
        }
      });
    }).catch(err => { });
  }

  /////////////////////////////////////////////////////////////
  //////////////////  Master  /////////////////////////////
  /////////////////////////////////////////////////////////////

  public async getMaster(): Promise<Master> {
    const correo = this.repo.getCorreo();

    try {
      await this.masterCollection.doc<Master>('ash').ref.get().then(resultado => {
        this.master = {
          nick: resultado.data()!.nick,
          exp: resultado.data()!.exp,
          level: resultado.data()!.level,
          pokeBalls: resultado.data()!.pokeBalls,
          superBalls: resultado.data()!.superBalls,
          ultraBalls: resultado.data()!.ultraBalls,
          masterBalls: resultado.data()!.masterBalls,
          region_ini: resultado.data()!.region_ini,
          poke_ini: resultado.data()!.poke_ini,
          capturados: resultado.data()!.capturados,
          favoritos: resultado.data()!.favoritos,
          team: resultado.data()!.team,
        };
      });

      if (correo) {
        await this.localDb.setMaster(correo, this.master);
      }

      return this.master;
    } catch (error) {
      if (correo) {
        const cachedMaster = await this.localDb.getMaster(correo);
        if (cachedMaster) {
          this.master = cachedMaster;
          return cachedMaster;
        }
      }

      throw error;
    }
  }

  public async addMaster(master: Master) {
    await this.masterCollection.doc<Master>('ash').set(master);
    const correo = this.repo.getCorreo();
    if (correo) { await this.localDb.setMaster(correo, master); }
  }

  public async updateMaster(master: Master) {
    await this.masterCollection.doc<Master>('ash').set(master, { merge: true });
    const correo = this.repo.getCorreo();
    if (correo) { await this.localDb.setMaster(correo, master); }
  }

  public async deleteMaster(master: Master) {
    await this.masterCollection.doc<Master>('ash').delete();
    const correo = this.repo.getCorreo();
    if (correo) { await this.localDb.clearUserData(correo); }
  }

  public async addPokemonAtrapado(pokemon: PokemonInterface): Promise<void> {
    let auxMaster: Master = this.repo.getMaster();

    // Verifica si hay hueco en el equipo
    // Hay espacio en el equipo, se añade directamente al equipo
    // No hay espacio en el equipo, se añade a los capturados
    if (auxMaster.team.length < 6) {
        auxMaster.team.push(pokemon);
    } else {
        auxMaster.capturados.push(pokemon);
    }

    // Guarda los cambios en el repositorio
    this.repo.setMaster(auxMaster);

    // Se incluye en la colección de la pokedex
    await this.addPokemon(pokemon);

    // Finalmente, actualiza el master
    return await this.updateMaster(auxMaster);
  }

  // private async addPokemonTeam(pokemon: PokemonInterface) {
  //   let auxMaster: Master = this.repo.getMaster();
  //   if (!(auxMaster.team.length >= 6)) {
  //     auxMaster.team.push(pokemon);
  //     this.repo.setMaster(auxMaster);
  //     await this.updateMaster(auxMaster);
  //   }
  // }

  public async addPokemonFavorito(pokemon: PokemonInterface) {
    let auxMaster: Master = this.repo.getMaster();
    auxMaster.favoritos!.push(pokemon.num_nation);
    this.repo.setMaster(auxMaster);
    await this.updateMaster(auxMaster);
  }

  /////////////////////////////////////////////////////////////
  //////////////////  Pokemon  ////////////////////////////////
  /////////////////////////////////////////////////////////////

  public async addPokemon(pokemon: PokemonInterface) {
    return await this.pokeCollection.doc<PokemonInterface>(pokemon.num_nation).set(pokemon);
  }

  public async getPokedex() {
    const correo = this.repo.getCorreo();

    try {
      let pokemons: PokemonInterface[] = await firstValueFrom(this.pokeCollection.get().pipe(
        map(snapshot => {
          return snapshot.docs.map(doc => {
            const data = doc.data() as PokemonInterface;
            return { ...data };
          });
        })
      ));

      this.repo.setPokedex(pokemons);
      if (correo) {
        await this.localDb.setPokedex(correo, pokemons);
      }
    } catch (error) {
      if (correo) {
        const cachedPokedex = await this.localDb.getPokedex(correo);
        if (cachedPokedex) {
          this.repo.setPokedex(cachedPokedex);
          return;
        }
      }

      throw error;
    }
  }

  private async getPokemonAtrapado(): Promise<PokemonInterface[]> {
    console.log('INI - firebase.service - getPokemonAtrapado');
    let pokes: PokemonInterface[] = [];

    pokes = await this.masterCollection.doc<Master>('ash').ref.get().then(resultado => {
      let aux: PokemonInterface[] = [];

      console.log(resultado);
      console.log(resultado.data()!.capturados);

      if (resultado.exists) {
        aux = resultado.data()!.capturados;
      } else {
        this.toast.presentarToast('No existen pokemon atrapados.', 'danger', 3000);
      }

      return aux;
    });

    console.log('FIN - firebase.service - getPokemonAtrapado');
    return pokes;
  }

  public async getTeamPokemon(): Promise<PokemonInterface[]> {
    console.log('INI - firebase.service - getTeamPokemon');
    let pokes: PokemonInterface[] = [];

    pokes = await this.masterCollection.doc<Master>('ash').ref.get().then((resultado) => {
      let aux: PokemonInterface[] = [];

      if (resultado.exists) {
        aux = resultado.data()!.team;
      } else {
        this.toast.presentarToast('No existen pokemon atrapados.', 'danger', 3000);
      }

      return aux;
    });

    console.log('FIN - firebase.service - getTeamPokemon');
    return pokes;
  }

}
