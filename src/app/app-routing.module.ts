import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/menu/tabs/tabs.module').then(m => m.TabsPageModule), canActivate: [authGuard] },
  { path: 'login', loadChildren: () => import('./pages/login_signin/login/login.module').then( m => m.LoginPageModule) },
  { path: 'signin', loadChildren: () => import('./pages/login_signin/signin/signin.module').then( m => m.SigninPageModule) },
  { path: 'iniregion', loadChildren: () => import('./pages/iniregion/iniregion.module').then( m => m.IniregionPageModule) },
  { path: 'modal-pokeball', loadChildren: () => import('./pages/modal-pokeball/modal-pokeball.module').then( m => m.ModalPokeballPageModule) },
  { path: 'team', loadChildren: () => import('./pages/team/team.module').then( m => m.TeamPageModule) },
  { path: 'poke-center', loadChildren: () => import('./pages/poke-center/poke-center.module').then( m => m.PokeCenterPageModule) },
  { path: 'captura/:id', loadChildren: () => import('./pages/catch/catch.module').then( m => m.CatchPageModule) },
  { path: 'modal2/:id', loadChildren: () => import('./pages/modal-description/modal-description.module').then( m => m.ModalDescriptionPageModule) },
  { path: 'modal', loadChildren: () => import('./pages/modal/modal.module').then( m => m.ModalPageModule) },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
