import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IniregionPage } from './iniregion.page';

const routes: Routes = [
  {
    path: '',
    component: IniregionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IniregionPageRoutingModule {}
