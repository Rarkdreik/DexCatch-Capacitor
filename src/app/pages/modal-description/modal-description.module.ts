import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalDescriptionPageRoutingModule } from './modal-description-routing.module';

import { ModalDescriptionPage } from './modal-description.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalDescriptionPageRoutingModule
  ],
  declarations: [ModalDescriptionPage]
})
export class ModalDescriptionPageModule {}
