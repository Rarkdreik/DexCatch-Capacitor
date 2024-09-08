import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QRCodeModule } from 'angularx-qrcode';
import { ExploreContainerComponentModule } from 'src/app/explore-container/explore-container.module';

import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { ModalQrComponent } from './modal_qr.component';
import { ViewerModalComponent } from 'src/app/component/viewermodal/viewermodal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ExploreContainerComponentModule,
    HomePageRoutingModule,
    QRCodeModule
  ],
  declarations: [HomePage, ModalQrComponent, ViewerModalComponent]
})
export class HomePageModule {}
