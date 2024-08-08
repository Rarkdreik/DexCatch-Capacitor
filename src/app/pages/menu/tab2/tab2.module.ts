import { IonicModule } from '@ionic/angular';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { ExploreContainerComponentModule } from '../../../explore-container/explore-container.module';
import { QRCodeModule } from 'angularx-qrcode';

import { Tab2PageRoutingModule } from './tab2-routing.module';
import { Tab2ModalComponent } from './tab2-modal.component';

@NgModule({
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExploreContainerComponentModule,
    Tab2PageRoutingModule,
    QRCodeModule
  ],
  declarations: [Tab2Page, Tab2ModalComponent]
})
export class Tab2PageModule {}
