import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalPokeballPage } from './modal-pokeball.page';

const routes: Routes = [
  {
    path: '',
    component: ModalPokeballPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalPokeballPageRoutingModule {}
