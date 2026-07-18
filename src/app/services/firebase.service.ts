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
import { ItemService } from './item.service';
import { LoggerService } from './logger.service';

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

  constructor(private af: AngularFirestore, private repo: RepositoryService, private alert: AlertsService, private toast: ToastService, private constants: ConstantService, private localDb: LocalDbService, private itemService: ItemService, private logger: LoggerService) { }

  public inicializar(correo: string) {
    const correoNormalizado = correo?.trim();
    this.logger.debug('FirebaseService.inicializar', 'Inicializando referencias Firestore', { correo: correoNormalizado || '(empty)', idApp: environment.id_app });

    if (!correoNormalizado) {
      this.logger.error('FirebaseService.inicializar', 'Correo vacio al inicializar Firebase');
      throw new Error('No hay correo de usuario para inicializar Firebase.');
    }

    this.catchdex_fb = this.af.collection(environment.id_app).doc(correoNormalizado);
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
    this.logger.info('FirebaseService.getDatosUsuario', 'Inicio lectura de datos de usuario', { email: user.email || '(empty)', uid: user.uid || '(empty)' });
    this.inicializar(user.email!);
    let userRef: AngularFirestoreDocument<UserData> = this.af.collection(user.email!).doc('correo');
    this.logger.debug('FirebaseService.getDatosUsuario', 'Leyendo documento de usuario', { path: `${user.email}/correo` });
    let auxUser: UserData = this.constants.user_empty;

    auxUser = await userRef.ref.get().then(result => {
      const data = result.data();
      this.logger.debug('FirebaseService.getDatosUsuario', 'Snapshot usuario recibido', { exists: result.exists, email: user.email });
      let userData: UserData = {
        uid: data?.uid ?? user.uid ?? '',
        email: data?.email ?? user.email ?? '',
        photoURL: data?.photoURL ?? user.photoURL ?? 'assets/images/avatar/avatar.png',
        displayName: data?.displayName ?? user.displayName ?? '',
      };
      return userData;
    }).catch(async (erroneo) => {
      this.logger.error('FirebaseService.getDatosUsuario', 'Error leyendo documento de usuario', erroneo);
      return auxUser;
    });

    this.logger.debug('FirebaseService.getDatosUsuario', 'Usuario preparado para repo/local', { email: auxUser.email || '(empty)', uid: auxUser.uid || '(empty)' });
    this.repo.setUsuario(auxUser);
    await this.localDb.setUser(auxUser);
    this.logger.debug('FirebaseService.getDatosUsuario', 'Leyendo master tras usuario', { email: auxUser.email || '(empty)' });
    this.master = await this.getMaster();
    this.repo.setMaster(this.master);
    this.repo.setRegion(this.master.region_ini);
    this.logger.info('FirebaseService.getDatosUsuario', 'Fin lectura de datos de usuario', { email: auxUser.email || '(empty)', masterNick: this.master.nick || '(empty)' });
    return auxUser;
  }

  /**
   *
   * @param user qwerty
   */
  public setDatosUsuario(user: any): UserData {
    this.logger.info('FirebaseService.setDatosUsuario', 'Guardando documento de usuario', { email: user.email || '(empty)', uid: user.uid || '(empty)' });

    if (!user.email) {
      this.logger.error('FirebaseService.setDatosUsuario', 'Email vacio al guardar usuario', user);
      throw new Error('No hay email de usuario para guardar sus datos.');
    }

    const userRef: AngularFirestoreDocument<UserData> = this.af.collection(user.email).doc('correo');
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
      this.logger.error('FirebaseService.setDatosUsuario', 'Error guardando el usuario localmente', error);
    });

    this.logger.info('FirebaseService.setDatosUsuario', 'Documento de usuario guardado/local actualizado', { email: auxUser.email, uid: auxUser.uid });
    return auxUser;
  }

  /**
   *
   * @param user qwerty
   */
  public async updateUserData(user: { email?: string | null; uid?: string | null; photoURL?: string | null; displayName?: string | null }): Promise<UserData> {
    this.logger.info('FirebaseService.updateUserData', 'Actualizando datos de usuario', { email: user.email || '(empty)', uid: user.uid || '(empty)' });

    if (!user.email) {
      this.logger.error('FirebaseService.updateUserData', 'Email vacio al actualizar usuario');
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

    this.logger.info('FirebaseService.updateUserData', 'Datos de usuario actualizados', { email: auxUser.email, uid: auxUser.uid });
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
    this.logger.info('FirebaseService.crearQr', 'Inicio crear/actualizar QR', { correo: codigoQr.correo || '(empty)' });

    const qrRef = this.af.collection(environment.id_app).doc('codigos').collection('qr').doc<QrcodeInterface>(codigoQr.correo);
    const snapshot = await qrRef.ref.get().catch((erroneo) => {
      this.logger.warn('FirebaseService.crearQr', 'No se ha podido leer el QR existente', erroneo);
      return null;
    });
    const currentQr = snapshot?.exists ? snapshot.data() : undefined;

    const data: QrcodeInterface = {
      codigo: currentQr?.codigo || codigoQr.codigo || this.generateQrCode(),
      correo: codigoQr.correo,
      usos: typeof currentQr?.usos === 'number' ? currentQr.usos : codigoQr.usos,
    };

    await qrRef.set(data, { merge: true });
    this.logger.info('FirebaseService.crearQr', 'Fin crear/actualizar QR', { correo: data.correo || '(empty)', usos: data.usos });
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
    this.logger.debug('FirebaseService.prueba', 'QR leido para canje', { length: codigo?.length ?? 0 });
    const payload = this.parseQrPayload(codigo);
    this.logger.verbose('FirebaseService.prueba', 'Payload QR parseado', payload);
    const correoActual = this.repo.getCorreo();

    if (!correoActual) {
      return this.qrFailure('No hay una cuenta activa para canjear el QR.');
    }

    if (!payload) {
      return this.qrFailure('El QR no pertenece a DexCatch o usa un formato antiguo.');
    }

    const qrRef = this.af.collection(environment.id_app).doc('codigos').collection('qr').doc<QrcodeInterface>(payload.correo);
    const masterRef = this.masterCollection.doc<Master>('ash');
    const rewardItems = this.itemService.buildQrRewardItems();
    const rewards = this.itemService.toQrRewards(rewardItems);
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
        const nextMaster: Master = this.itemService.ensureMasterItems({
          ...masterBase,
          favoritos: masterBase.favoritos ?? [],
          items: Array.isArray(masterBase.items) ? [...masterBase.items] : [],
        });

        rewardItems.forEach(item => this.itemService.addOrUpdateItem(nextMaster.items, item));

        const cleanNextMaster = this.sanitizeForFirestore(nextMaster);
        transaction.set(masterRef.ref, cleanNextMaster, { merge: true });
        transaction.update(qrRef.ref, { usos: qrData.usos - 1 });
        updatedMaster = cleanNextMaster;

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
      this.logger.error('FirebaseService.prueba', 'No se ha podido canjear el QR', error);
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
    return this.itemService.toQrRewards(this.itemService.buildQrRewardItems());
  }

  private qrFailure(message: string): QrRedemptionResult {
    return { ok: false, message, rewards: [] };
  }
  /////////////////////////////////////////////////////////////
  //////////////////  Master  /////////////////////////////
  /////////////////////////////////////////////////////////////

  public async getMaster(): Promise<Master> {
    const correo = this.repo.getCorreo();
    this.logger.info('FirebaseService.getMaster', 'Inicio lectura de master', { correo: correo || '(empty)' });

    try {
      await this.masterCollection.doc<Master>('ash').ref.get().then(resultado => {
        this.logger.debug('FirebaseService.getMaster', 'Snapshot master recibido', { exists: resultado.exists, correo: correo || '(empty)' });

        if (!resultado.exists) {
          throw new Error('No existe documento master ash.');
        }

        const data = resultado.data()!;
        this.master = this.itemService.ensureMasterItems({
          nick: data.nick,
          exp: data.exp,
          level: data.level,
          region_ini: data.region_ini,
          poke_ini: data.poke_ini,
          capturados: data.capturados,
          favoritos: data.favoritos,
          team: data.team,
          money: data.money,
          items: data.items,
        });
      });

      if (correo) {
        await this.localDb.setMaster(correo, this.master);
      }

      this.logger.info('FirebaseService.getMaster', 'Master cargado', { correo: correo || '(empty)', nick: this.master.nick || '(empty)', items: this.master.items?.length ?? 0 });
      return this.master;
    } catch (error) {
      if (correo) {
        const cachedMaster = await this.localDb.getMaster(correo);
        if (cachedMaster) {
          this.master = this.itemService.ensureMasterItems(cachedMaster);
          this.logger.info('FirebaseService.getMaster', 'Master cargado desde cache local', { correo, nick: this.master.nick || '(empty)', items: this.master.items?.length ?? 0 });
          return this.master;
        }
      }

      this.logger.warn('FirebaseService.getMaster', 'No se pudo cargar master remoto ni cache', { correo: correo || '(empty)', error });
      throw error;
    }
  }

  public async addMaster(master: Master) {
    const normalizedMaster = this.sanitizeForFirestore(this.itemService.ensureMasterItems(master));
    this.logger.info('FirebaseService.addMaster', 'Guardando master', { nick: normalizedMaster.nick, team: normalizedMaster.team?.length ?? 0, capturados: normalizedMaster.capturados?.length ?? 0, items: normalizedMaster.items?.length ?? 0 });
    await this.masterCollection.doc<Master>('ash').set(normalizedMaster);
    const correo = this.repo.getCorreo();
    if (correo) { await this.localDb.setMaster(correo, normalizedMaster); }
  }

  public async updateMaster(master: Master) {
    const normalizedMaster = this.sanitizeForFirestore(this.itemService.ensureMasterItems(master));
    this.logger.debug('FirebaseService.updateMaster', 'Actualizando master', { nick: normalizedMaster.nick, team: normalizedMaster.team?.length ?? 0, capturados: normalizedMaster.capturados?.length ?? 0, items: normalizedMaster.items?.length ?? 0 });
    await this.masterCollection.doc<Master>('ash').set(normalizedMaster, { merge: true });
    const correo = this.repo.getCorreo();
    if (correo) { await this.localDb.setMaster(correo, normalizedMaster); }
  }

  public async deleteMaster(master: Master) {
    await this.masterCollection.doc<Master>('ash').delete();
    const correo = this.repo.getCorreo();
    if (correo) { await this.localDb.clearUserData(correo); }
  }

  public async addPokemonAtrapado(pokemon: PokemonInterface): Promise<void> {
    let auxMaster: Master = this.repo.getMaster();
    this.logger.info('FirebaseService.addPokemonAtrapado', 'Anadiendo Pokemon atrapado al master', { numNation: pokemon.num_nation || '(empty)', name: pokemon.name || '(empty)', team: auxMaster.team?.length ?? 0, capturados: auxMaster.capturados?.length ?? 0 });

    if (auxMaster.team.length < 6) {
      auxMaster.team.push(pokemon);
    } else {
      auxMaster.capturados.push(pokemon);
    }

    this.repo.setMaster(auxMaster);
    await this.addPokemon(pokemon);
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
    this.logger.debug('FirebaseService.addPokemonFavorito', 'Anadiendo Pokemon favorito', { numNation: pokemon.num_nation || '(empty)', favoritos: auxMaster.favoritos?.length ?? 0 });
    auxMaster.favoritos!.push(pokemon.num_nation);
    this.repo.setMaster(auxMaster);
    await this.updateMaster(auxMaster);
  }

  /////////////////////////////////////////////////////////////
  //////////////////  Pokemon  ////////////////////////////////
  /////////////////////////////////////////////////////////////

  public async addPokemon(pokemon: PokemonInterface) {
    const cleanPokemon = this.sanitizeForFirestore(pokemon);

    if (!cleanPokemon.num_nation) {
      this.logger.error('FirebaseService.addPokemon', 'Numero nacional vacio al guardar Pokemon', cleanPokemon);
      throw new Error('No hay numero nacional para guardar el Pokemon en Firebase.');
    }

    this.logger.debug('FirebaseService.addPokemon', 'Guardando Pokemon en pokedex', { numNation: cleanPokemon.num_nation, name: cleanPokemon.name || '(empty)' });
    await this.pokeCollection.doc<PokemonInterface>(cleanPokemon.num_nation).set(cleanPokemon);

    const correo = this.repo.getCorreo();
    const pokedex = this.repo.getPokedex();
    const index = pokedex.findIndex(auxPokemon => auxPokemon.num_nation === cleanPokemon.num_nation);

    if (index >= 0) {
      pokedex[index] = cleanPokemon;
    } else {
      pokedex.push(cleanPokemon);
    }

    this.repo.setPokedex(pokedex);
    if (correo) { await this.localDb.setPokedex(correo, pokedex); }
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

      this.logger.warn('FirebaseService.getMaster', 'No se pudo cargar master remoto ni cache', { correo: correo || '(empty)', error });
      throw error;
    }
  }

  private async getPokemonAtrapado(): Promise<PokemonInterface[]> {
    this.logger.debug('FirebaseService.getPokemonAtrapado', 'Inicio lectura de Pokemon atrapados');
    let pokes: PokemonInterface[] = [];

    pokes = await this.masterCollection.doc<Master>('ash').ref.get().then(resultado => {
      let aux: PokemonInterface[] = [];

      this.logger.verbose('FirebaseService.getPokemonAtrapado', 'Snapshot recibido', { exists: resultado.exists });
      this.logger.verbose('FirebaseService.getPokemonAtrapado', 'Capturados recibidos', { count: resultado.data()?.capturados?.length ?? 0 });

      if (resultado.exists) {
        aux = resultado.data()!.capturados;
      } else {
        this.toast.presentarToast('No existen pokemon atrapados.', 'danger', 3000);
      }

      return aux;
    });

    this.logger.debug('FirebaseService.getPokemonAtrapado', 'Fin lectura de Pokemon atrapados', { count: pokes.length });
    return pokes;
  }

  public async getTeamPokemon(): Promise<PokemonInterface[]> {
    this.logger.debug('FirebaseService.getTeamPokemon', 'Inicio lectura de equipo');
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

    this.logger.debug('FirebaseService.getTeamPokemon', 'Fin lectura de equipo', { count: pokes.length });
    return pokes;
  }

  private sanitizeForFirestore<T>(value: T): T {
    if (Array.isArray(value)) {
      return value.map(item => item === undefined ? null : this.sanitizeForFirestore(item)) as T;
    }

    if (value !== null && typeof value === 'object') {
      if (Object.prototype.toString.call(value) !== '[object Object]') {
        return value;
      }

      const cleanValue: Record<string, unknown> = {};
      Object.entries(value as Record<string, unknown>).forEach(([key, fieldValue]) => {
        if (fieldValue !== undefined) {
          cleanValue[key] = this.sanitizeForFirestore(fieldValue);
        }
      });

      return cleanValue as T;
    }

    return value;
  }

}
