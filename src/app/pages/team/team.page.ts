import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Master } from 'src/app/model/Master';
import { PokemonInterface } from 'src/app/model/Pokemon';
import { AlertsService } from 'src/app/services/alerta.service';
import { ConstantService } from 'src/app/services/constant.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoadingService } from 'src/app/services/loading.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { StatsService } from 'src/app/services/stats.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.page.html',
  styleUrls: ['./team.page.scss'],
})
export class TeamPage implements OnInit {
  master: Master = this.constants.master_empty;
  selectedTeamIndex: any = null;
  selectedCapturedIndex: any = null;
  team: any[] = [];
  capturedPokemons: any[] = [];

  constructor(public router: Router, public repo: RepositoryService, private toast: ToastService, public stats: StatsService, private loading: LoadingService, private alerta: AlertsService, private fire: FirebaseService, private constants: ConstantService) { }

  ngOnInit() {
    console.log("INI - team - ngOnInit");
    this.master = this.repo.getMaster();
    this.capturedPokemons = this.master.capturados;
    let team_poke: PokemonInterface[] = this.master.team;
    this.team = [];

    // for (let i = 0; i < 6; i++) {
    //   // Usamos el operador de propagación para crear una copia del objeto
    //   let poke_aux1: PokemonInterface = { ...this.constants.poke_empty };
    //   poke_aux1.num_nation = '10' + i;
    //   poke_aux1 = { ...this.stats.getStatsPokemon(poke_aux1.num_nation) };
    //   poke_aux1.ball = 'pokeball';
    //   poke_aux1.img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${ +poke_aux1.num_nation }.png`;
    //   this.team.push(poke_aux1);
    // }

    // for (let i = 10; i < 27; i++) {
    //   // Usamos el operador de propagación para crear una copia del objeto
    //   let poke_aux2: PokemonInterface = { ...this.constants.poke_empty };
    //   poke_aux2.num_nation = '2' + i;
    //   poke_aux2 = { ...this.stats.getStatsPokemon(poke_aux2.num_nation) };
    //   poke_aux2.ball = 'ultraball';
    //   poke_aux2.img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${ +poke_aux2.num_nation }.png`;
    //   this.capturedPokemons.push(poke_aux2);
    // }

    team_poke.forEach((poke: PokemonInterface) => {
      if (poke) {
        poke.item = `../../../assets/images/item_pokemon/${ poke.ball }.png`;
        poke.img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${ +poke.num_nation }.png`;
      }

      this.team.push(poke);
    });

    this.capturedPokemons.forEach((poke: PokemonInterface) => {
      if (poke) {
        poke.item = `../../../assets/images/item_pokemon/${ poke.ball }.png`;
        poke.img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${ +poke.num_nation }.png`;
      }
    });

    // Rellenar para asegurar que al menos hay 20 elementos
    // Rellenar para que la longitud sea un múltiplo de 4
    while (this.capturedPokemons.length < 10 || this.capturedPokemons.length % 4 !== 0) {
      this.capturedPokemons.push(null);
    }

    while (this.team.length < 6) {
      this.team.push(null);
    }

    console.log("FIN - team - ngOnInit");
  }

  public goMain() {
    setTimeout(() => { this.router.navigate(['/home'], { replaceUrl: true }); }, 900);
  }

  selectTeamMember(index: number) {
    if (this.selectedTeamIndex === index)
      this.selectedTeamIndex = null;
    else
      this.selectedTeamIndex = index;

    this.selectedCapturedIndex = null;
  }

  selectCapturedPokemon(index: number) {
    if (this.selectedCapturedIndex === index)
      this.selectedCapturedIndex = null;
    else
      this.selectedCapturedIndex = index;

    // this.shouldPulse(this.capturedPokemons[index], index);
  }

  addOrChangePokemon() {
    if (this.selectedTeamIndex !== null && this.selectedCapturedIndex !== null) {
      let selectedTeamPokemon = this.team[this.selectedTeamIndex];
      let selectedCapturedPokemon = this.capturedPokemons[this.selectedCapturedIndex];
  
      // Verifica si el Pokémon seleccionado en el equipo es el último no nulo
      const nonNullPokemons = this.team.filter(pokemon => pokemon !== null);
  
      if (nonNullPokemons.length === 1 && selectedCapturedPokemon === null) {
        this.toast.presentarToast('No puedes cambiar el último Pokémon por uno vacío', 'danger', 3000);
        return;
      }
  
      // Realiza el intercambio
      this.team[this.selectedTeamIndex] = selectedCapturedPokemon;
      this.capturedPokemons[this.selectedCapturedIndex] = selectedTeamPokemon;
  
      // Ordena el equipo, moviendo los nulos al final
      this.team = this.team.filter(pokemon => pokemon !== null).concat(this.team.filter(pokemon => pokemon === null));
  
      this.updateMaster();
  
      // Limpiar la selección
      this.selectedCapturedIndex = null;
      this.selectedTeamIndex = null;
    }
  }

  async releasePokemon() {
    if (this.selectedTeamIndex !== null && this.selectedCapturedIndex == null) {
      if (this.team.filter(pokemon => pokemon !== null).length > 1) {
        this.team.splice(this.selectedTeamIndex, 1);
        this.team.push(null);

        this.updateMaster();
        this.selectedTeamIndex = null;
      } else {
        await this.toast.presentarToast('No puedes liberar el último Pokémon del equipo', 'warning', 3000);
      }
    } else if (this.selectedCapturedIndex !== null && this.selectedTeamIndex == null) {
      this.capturedPokemons.splice(this.selectedCapturedIndex, 1);
      this.capturedPokemons.push(null);
      
      this.updateMaster();
      this.selectedCapturedIndex = null;
    }
  }

  assignItem() {
    // Lógica para asignar un item
  }

  showPokemonInfo() {
    // Abre un modal con la información del Pokémon seleccionado
  }

  // shouldPulse(pokemon: any, index: number) {
  //   let pulse = false;
    // if (this.selectedTeamIndex !== null) {
    //   return this.selectedCapturedIndex === null && !this.team.includes(pokemon);
    // } else if (this.selectedCapturedIndex !== null) {
    //   return true;
    // } else {
    //   return !this.team[index];
    // }

    // if (this.selectedCapturedIndex != null)
    //   pulse = !this.capturedPokemons[this.selectedCapturedIndex];

    // console.log(`${index} -- ${pulse} -- selected=${this.selectedCapturedIndex} -- team=${this.capturedPokemons[index]} -- team=${!this.capturedPokemons[this.selectedCapturedIndex]}`);

  //   return pulse;
  // }

  loadMore(event: any) {
    // Cargar más Pokémon capturados
    event.target.complete();
  }

  private updateMaster() {
    // Filtra los elementos no nulos de team y capturedPokemons
    const filteredTeam = this.team.filter(pokemon => pokemon !== null);
    const filteredCapturedPokemons = this.capturedPokemons.filter(pokemon => pokemon !== null);

    // Asigna los arrays filtrados al master
    this.master.team = filteredTeam;
    this.master.capturados = filteredCapturedPokemons;

    // Guarda los cambios en el repositorio y en Firebase
    this.repo.setMaster(this.master);
    this.fire.updateMaster(this.master);
  }

}
