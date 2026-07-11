import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Master } from '../model/Master';
import { PokemonInterface } from '../model/Pokemon';
import { UserData } from '../model/UserData';

@Injectable({
  providedIn: 'root'
})
export class LocalDbService {
  private readonly prefix = 'dexcatch';

  public async setUser(user: UserData | null): Promise<void> {
    await this.setJson('session.user', user);
  }

  public async getUser(): Promise<UserData | null> {
    return this.getJson<UserData>('session.user');
  }

  public async clearUser(): Promise<void> {
    await Preferences.remove({ key: this.key('session.user') });
  }

  public async setMaster(email: string, master: Master | null): Promise<void> {
    await this.setJson(this.userKey(email, 'master'), master);
  }

  public async getMaster(email: string): Promise<Master | null> {
    return this.getJson<Master>(this.userKey(email, 'master'));
  }

  public async setPokedex(email: string, pokedex: PokemonInterface[] | null): Promise<void> {
    await this.setJson(this.userKey(email, 'pokedex'), pokedex);
  }

  public async getPokedex(email: string): Promise<PokemonInterface[] | null> {
    return this.getJson<PokemonInterface[]>(this.userKey(email, 'pokedex'));
  }

  public async clearUserData(email: string): Promise<void> {
    await Promise.all([
      Preferences.remove({ key: this.key(this.userKey(email, 'master')) }),
      Preferences.remove({ key: this.key(this.userKey(email, 'pokedex')) })
    ]);
  }

  private async setJson<T>(scope: string, value: T | null): Promise<void> {
    const key = this.key(scope);

    if (value === null || value === undefined) {
      await Preferences.remove({ key });
      return;
    }

    await Preferences.set({ key, value: JSON.stringify(value) });
  }

  private async getJson<T>(scope: string): Promise<T | null> {
    const key = this.key(scope);
    const { value } = await Preferences.get({ key });

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      await Preferences.remove({ key });
      return null;
    }
  }

  private userKey(email: string, entity: string): string {
    return `user.${encodeURIComponent(email.toLowerCase())}.${entity}`;
  }

  private key(scope: string): string {
    return `${this.prefix}.${scope}`;
  }
}
