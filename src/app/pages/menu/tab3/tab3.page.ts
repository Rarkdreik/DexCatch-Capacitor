import { Component } from '@angular/core';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { ConstantService } from '../../../services/constant.service';
import { StatsService } from '../../../services/stats.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  public poke: PokemonInterface = this.constants.poke_empty;
  public pokemons: PokemonInterface[] = [];
  public barraHP: any;
  intervalId: any;

  constructor(private constants: ConstantService, private stats: StatsService) {
    this.barraHP = { width: '0%' };
    this.poke = this.stats.getStatsPokemon('004');
    this.poke.hp = 3;
    this.poke.ball = 'superball';
    this.pokemons.push(this.poke);
    this.poke = this.stats.getStatsPokemon('404');
    this.poke.hp = 4;
    this.poke.ball = 'pokeball';
    this.pokemons.push(this.poke);
    this.poke = this.stats.getStatsPokemon('212');
    this.poke.hp = 5;
    this.poke.ball = 'ultraball';
    this.pokemons.push(this.poke);
    this.poke = this.stats.getStatsPokemon('508');
    this.poke.hp = 1;
    this.poke.ball = 'masterball';
    this.pokemons.push(this.poke);
    this.pokemons.push(this.poke);
    this.pokemons.push(this.poke);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  public async heal() {
    let currentWidth = 0;
    this.intervalId = setInterval(async () => {
      if (currentWidth < 100) {
        currentWidth += 1; // Incrementa la anchura en 1% cada segundo
        this.barraHP = { width: `${currentWidth}%` };
      } else {
        clearInterval(this.intervalId); // Detiene el intervalo cuando llega al 100%
      }
    }, 90); // Actualiza cada segundo
  }

}
