import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PokeCenterPage } from './poke-center.page';

const routes: Routes = [
  {
    path: '',
    component: PokeCenterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PokeCenterPageRoutingModule {}
