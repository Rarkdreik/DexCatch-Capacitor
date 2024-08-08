import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IniregionPageRoutingModule } from './iniregion-routing.module';

import { IniregionPage } from './iniregion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    IniregionPageRoutingModule
  ],
  declarations: [IniregionPage]
})
export class IniregionPageModule {}
