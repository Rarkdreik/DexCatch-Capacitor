import { inject, Injectable } from '@angular/core';
import { Master } from '../model/Master';
import { QrcodeInterface, QrPayloadInterface, QrRedemptionResult, QrRewardItem } from '../model/Qrcode';
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

    if (user.displayName == null || user.displayName == '') {
      auxUser.displayName = '';
      auxUser.photoURL = '../../assets/images/avatar/avatar.png';
    }

    userRef.set(auxUser, { merge: true });
    this.repo.setUsuario(auxUser);
    void this.localDb.setUser(auxUser).catch(error => {
      console.error('Error guardando el usuario localmente', error);
    });

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

  public buildQrPayload(codigoQr: QrcodeInterface): string {
    const payload: QrPayloadInterface = {
      type: 'dexcatch-qr',
      version: 1,
      correo: codigoQr.correo,
      codigo: codigoQr.codigo,
    };

    return JSON.stringify(payload);
  }

  /**
   * Crea o actualiza el QR publico del entrenador sin regenerarlo en cada carga.
   */
  public async crearQr(codigoQr: QrcodeInterface): Promise<QrcodeInterface> {
    console.log('INI - firebase.service - crearQr');

    const qrRef = this.af.collection(environment.id_app).doc('codigos').collection('qr').doc<QrcodeInterface>(codigoQr.correo);
    const snapshot = await qrRef.ref.get().catch((erroneo) => {
      console.error('No se ha podido leer el QR existente.', erroneo);
      return null;
    });
    const currentQr = snapshot?.exists ? snapshot.data() : undefined;

    const data: QrcodeInterface = {
      codigo: currentQr?.codigo || codigoQr.codigo || this.generateQrCode(),
      correo: codigoQr.correo,
      usos: typeof currentQr?.usos === 'number' ? currentQr.usos : codigoQr.usos,
    };

    await qrRef.set(data, { merge: true });
    console.log('FIN - firebase.service - crearQr');
    return data;
  }

  public async actualizarQr(codigoQr: QrcodeInterface) {
    const qrRef = this.af.collection(environment.id_app).doc('codigos').collection('qr').doc<QrcodeInterface>(codigoQr.correo);

    return await qrRef.update(codigoQr).then(() => {
      this.toast.presentarToast('Codigo qr actualizado.', 'warning', 3000);
    }).catch(async (erroneo) => {
      this.toast.cerrarToast();
      this.toast.presentarToast('No se ha podido actualizar el codigo qr. ' + erroneo, 'warning', 5000, true);
    });
  }

  public async deleteQr(correo: string) {
    const qrRef = this.af.collection(environment.id_app).doc('codigos').collection('qr').doc<QrcodeInterface>(correo);
    return await qrRef.delete();
  }

  public async prueba(codigo: string): Promise<QrRedemptionResult> {
    console.log('QR scan text read', codigo);
    const payload = this.parseQrPayload(codigo);
    console.log('QR scan parsed payload', payload);
    const correoActual = this.repo.getCorreo();

    if (!correoActual) {
      return this.qrFailure('No hay una cuenta activa para canjear el QR.');
    }

    if (!payload) {
      return this.qrFailure('El QR no pertenece a DexCatch o usa un formato antiguo.');
    }

    const qrRef = this.af.collection(environment.id_app).doc('codigos').collection('qr').doc<QrcodeInterface>(payload.correo);
    const masterRef = this.masterCollection.doc<Master>('ash');
    const rewards = this.getQrRewards();
    let updatedMaster: Master | null = null;

    try {
      const result = await this.af.firestore.runTransaction<QrRedemptionResult>(async (transaction) => {
        const qrSnapshot = await transaction.get(qrRef.ref);

        if (!qrSnapshot.exists) {
          return this.qrFailure('El QR no existe o ya no esta disponible.');
        }

        const qrData = qrSnapshot.data() as QrcodeInterface;

        if (qrData.correo !== payload.correo || qrData.codigo !== payload.codigo) {
          return this.qrFailure('El QR no coincide con el codigo publicado.');
        }

        if ((qrData.usos ?? 0) <= 0) {
          return this.qrFailure('Ya no se puede usar este codigo QR.');
        }

        const masterSnapshot = await transaction.get(masterRef.ref);
        const masterBase = (masterSnapshot.exists ? masterSnapshot.data() : this.repo.getMaster()) as Master;
        const nextMaster: Master = {
          ...masterBase,
          pokeBalls: (masterBase.pokeBalls ?? 0) + 5,
          superBalls: (masterBase.superBalls ?? 0) + 3,
          ultraBalls: (masterBase.ultraBalls ?? 0) + 2,
          masterBalls: (masterBase.masterBalls ?? 0) + 1,
          favoritos: masterBase.favoritos ?? [],
        };

        transaction.set(masterRef.ref, nextMaster, { merge: true });
        transaction.update(qrRef.ref, { usos: qrData.usos - 1 });
        updatedMaster = nextMaster;

        return {
          ok: true,
          message: 'QR leido correctamente. Recompensa obtenida.',
          rewards,
          ownerEmail: payload.correo,
          remainingUses: qrData.usos - 1,
        };
      });

      if (result.ok && updatedMaster) {
        this.repo.setMaster(updatedMaster);
        await this.localDb.setMaster(correoActual, updatedMaster);
      }

      return result;
    } catch (error) {
      console.error('No se ha podido canjear el QR.', error);
      return this.qrFailure('No se ha podido canjear el QR. Revisa permisos o conexion.');
    }
  }

  private parseQrPayload(value: string): QrPayloadInterface | null {
    try {
      const data = JSON.parse(value.trim()) as Partial<QrPayloadInterface> & { t?: string; v?: number; e?: string; c?: string };
      const type = data.type || data.t;
      const correo = data.correo || data.e;
      const codigo = data.codigo || data.c;
      const version = data.version || data.v || 1;

      if (type !== 'dexcatch-qr' || typeof correo !== 'string' || typeof codigo !== 'string' || !correo || !codigo) {
        return null;
      }

      return { type: 'dexcatch-qr', version, correo, codigo };
    } catch (error) {
      return null;
    }
  }

  private generateQrCode(): string {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    const randomPart = Math.random().toString(36).slice(2);
    return `${Date.now()}-${randomPart}`;
  }

  private getQrRewards(): QrRewardItem[] {
    return [
      { key: 'pokeBalls', nombre: 'Pokeball', cantidad: 5, imagen: 'assets/images/item_pokemon/pokeball.png' },
      { key: 'superBalls', nombre: 'Superball', cantidad: 3, imagen: 'assets/images/item_pokemon/superball.png' },
      { key: 'ultraBalls', nombre: 'Ultraball', cantidad: 2, imagen: 'assets/images/item_pokemon/ultraball.png' },
      { key: 'masterBalls', nombre: 'Masterball', cantidad: 1, imagen: 'assets/images/item_pokemon/masterball.png' },
    ];
  }

  private qrFailure(message: string): QrRedemptionResult {
    return { ok: false, message, rewards: [] };
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
          money: resultado.data()!.money,
          items: resultado.data()!.items,
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
    // Hay espacio en el equipo, se aÃ±ade directamente al equipo
    // No hay espacio en el equipo, se aÃ±ade a los capturados
    if (auxMaster.team.length < 6) {
        auxMaster.team.push(pokemon);
    } else {
        auxMaster.capturados.push(pokemon);
    }

    // Guarda los cambios en el repositorio
    this.repo.setMaster(auxMaster);

    // Se incluye en la colecciÃ³n de la pokedex
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
