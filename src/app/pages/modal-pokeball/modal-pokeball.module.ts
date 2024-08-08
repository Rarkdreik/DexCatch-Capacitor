import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalPokeballPageRoutingModule } from './modal-pokeball-routing.module';

import { ModalPokeballPage } from './modal-pokeball.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalPokeballPageRoutingModule
  ],
  declarations: [ModalPokeballPage]
})
export class ModalPokeballPageModule {}
