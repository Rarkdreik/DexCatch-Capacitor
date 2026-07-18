import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FocusService {
  public clearActiveElement(): void {
    const activeElement = document.activeElement as HTMLElement | null;

    if (activeElement && typeof activeElement.blur === 'function') {
      activeElement.blur();
    }
  }
}