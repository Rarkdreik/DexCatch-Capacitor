import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GsapService } from 'src/app/services/gsap-service.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public modal_style: any = 'modal modal-lock';

  constructor(public gsapp: GsapService, public router: Router) {}

  async ngOnInit() {

    const togglePokedex = (event: Event): void => {
      event.preventDefault();
      const pokedex = document.getElementById('pokedex') as HTMLElement;
      let summon = document.querySelector('.summon') as HTMLElement;
      let pokemonImg = document.querySelector('.pokemon img') as HTMLElement;

      if (pokedex.classList.contains('open')) {
        pokedex.classList.remove('open');
        if (summon != undefined && pokemonImg != undefined)
          this.gsapp.retrieve!.restart();
      } else {
        pokedex.classList.add('open');
        if (summon != undefined && pokemonImg != undefined)
          this.gsapp.spawn!.restart();
      }
    }

    const button = document.getElementById('toggle-button') as HTMLElement;

    if (button) {
      button.addEventListener('click', togglePokedex);
    }
  }

  public goMain() {
    this.router.navigate(['/home'], { replaceUrl: true });;
  }

}
