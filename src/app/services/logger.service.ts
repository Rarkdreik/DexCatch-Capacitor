import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export type LogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

interface LogSettings {
  enabled: boolean;
  level: LogLevel;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly enabledKey = 'dexcatch.logs.enabled';
  private readonly levelKey = 'dexcatch.logs.level';
  private readonly priority: Record<LogLevel, number> = {
    verbose: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    silent: 5,
  };

  public verbose(context: string, message: string, data?: unknown): void {
    this.write('verbose', context, message, data);
  }

  public debug(context: string, message: string, data?: unknown): void {
    this.write('debug', context, message, data);
  }

  public info(context: string, message: string, data?: unknown): void {
    this.write('info', context, message, data);
  }

  public warn(context: string, message: string, data?: unknown): void {
    this.write('warn', context, message, data);
  }

  public error(context: string, message: string, data?: unknown): void {
    this.write('error', context, message, data);
  }

  public setEnabled(enabled: boolean): void {
    localStorage.setItem(this.enabledKey, String(enabled));
  }

  public setLevel(level: LogLevel): void {
    localStorage.setItem(this.levelKey, level);
  }

  public clearOverrides(): void {
    localStorage.removeItem(this.enabledKey);
    localStorage.removeItem(this.levelKey);
  }

  private write(level: Exclude<LogLevel, 'silent'>, context: string, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const label = `[DexCatch][${level.toUpperCase()}][${context}] ${message}`;
    const payload = data === undefined ? [] : [data];

    switch (level) {
      case 'error':
        console.error(label, ...payload);
        break;
      case 'warn':
        console.warn(label, ...payload);
        break;
      case 'info':
        console.info(label, ...payload);
        break;
      default:
        console.debug(label, ...payload);
        break;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const settings = this.getSettings();
    return settings.enabled && this.priority[level] >= this.priority[settings.level];
  }

  private getSettings(): LogSettings {
    const configured = (environment as any).logging ?? {};
    const enabledOverride = localStorage.getItem(this.enabledKey);
    const levelOverride = localStorage.getItem(this.levelKey) as LogLevel | null;

    return {
      enabled: enabledOverride === null ? configured.enabled !== false : enabledOverride === 'true',
      level: this.normalizeLevel(levelOverride ?? configured.level ?? 'info'),
    };
  }

  private normalizeLevel(level: string): LogLevel {
    return Object.prototype.hasOwnProperty.call(this.priority, level) ? level as LogLevel : 'info';
  }
}