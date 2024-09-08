import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private router: Router) {}

  ionTabsDidChange() {
    console.log("INI - tabs - ionTabsDidChange");
    console.log("FIN - tabs - ionTabsDidChange");
  }

  ionTabsWillChange() {
    console.log("INI - tabs - ionTabsWillChange");
    console.log("FIN - tabs - ionTabsWillChange");
  }

  /**
   * goPokedex
   */
  public goPokedex() {
    this.router.navigate(['/pokedex'], { replaceUrl: true });
  }

}
