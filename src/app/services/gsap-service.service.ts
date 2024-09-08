import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GsapService {

  public spawn: gsap.core.Timeline | undefined;
  public retrieve: gsap.core.Timeline | undefined;

  constructor() {
  }

  public setSpawn() {
    this.spawn = gsap.timeline({
      onStart: function () {
        const summon = document.querySelector('.summon') as HTMLElement;
        const pokemonImg = document.querySelector('.pokemon img') as HTMLElement;
        if (summon) summon.classList.remove('hidden');
        if (summon) summon.style.filter = 'url(#spawn-line)';
        if (pokemonImg) pokemonImg.style.filter = 'url(#spawn-pokemon)';
      },
      onComplete: function () {
        const summon = document.querySelector('.summon') as HTMLElement;
        const pokemonImg = document.querySelector('.pokemon img') as HTMLElement;
        if (summon) summon.classList.add('hidden');
        if (summon) summon.style.filter = 'none';
        if (pokemonImg) pokemonImg.style.filter = 'none';
      },
        paused: true,
    }).set('.path', { attr: { 'stroke-dashoffset': '100%', }, 
    }).to('.path', { delay: 0.2, duration: 0.2, attr: { 'stroke-dashoffset': '0%', },
    }).to('.path', { duration: 0.2, attr: { 'stroke-dashoffset': '-100%', },
    }).from('.pokemon img', { duration: 0.2, scale: 0, }, 0.4
    ).to('#pokemon-displacement', { duration: 0.8, attr: { scale: 0, }, ease: 'none', }, 0.2
    ).to('#pokemon-turbulence', { duration: 0.8, attr: { baseFrequency: 0.03, }, ease: 'none', }, 0.2
    ).from('.tags', { opacity: 0, }, 0.4
    );
  }

  public setRetrieve() {
    this.retrieve = gsap.timeline({
      onStart: function () {
        const summon = document.querySelector('.summon') as HTMLElement;
        const pokemonImg = document.querySelector('.pokemon img') as HTMLElement;
        if (summon) summon.classList.remove('hidden');
        if (summon) summon.style.filter = 'url(#retrieve-line)';
        if (pokemonImg) pokemonImg.style.filter = 'url(#retrieve-pokemon)';
      },
      onComplete: function () {
        const summon = document.querySelector('.summon') as HTMLElement;
        const pokemonImg = document.querySelector('.pokemon img') as HTMLElement;
        if (summon) summon.classList.add('hidden');
        if (summon) summon.style.filter = 'none';
        if (pokemonImg) pokemonImg.style.filter = 'none';
      },
        paused: true,
      }).set('.path', { attr: { 'stroke-dashoffset': '-100%', },
      }).to('.tags', { opacity: 0, }
      ).from('#retrieve-displacement', { duration: 0.3, attr: { scale: 0, }, }, 0
      ).from( '#retrieve-turbulence', { duration: 0.3, attr: { baseFrequency: 0, }, }, 0
      ).to('.pokemon img', { scale: 0, duration: 0.2, }, 0.3
      ).to('.path', { duration: 0.2, attr: { 'stroke-dashoffset': '0%', }, }, 0.35
      ).to('.path', { duration: 0.2, attr: { 'stroke-dashoffset': '100%', }, }, 0.45
      );
  }

}
