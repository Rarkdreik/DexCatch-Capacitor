import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PokeCenterPageRoutingModule } from './poke-center-routing.module';

import { PokeCenterPage } from './poke-center.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PokeCenterPageRoutingModule
  ],
  declarations: [PokeCenterPage]
})
export class PokeCenterPageModule {}
