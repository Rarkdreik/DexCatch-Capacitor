import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalDescriptionPage } from './modal-description.page';

const routes: Routes = [
  {
    path: '',
    component: ModalDescriptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalDescriptionPageRoutingModule {}
