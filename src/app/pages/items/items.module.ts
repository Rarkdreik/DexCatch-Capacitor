import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemsPageRoutingModule } from './items-routing.module';
import { ItemsPage } from './items.page';
import { ItemsModalComponent } from 'src/app/component/items-modal/items-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemsPageRoutingModule
  ],
  declarations: [ItemsPage, ItemsModalComponent]
})
export class ItemsPageModule {}
