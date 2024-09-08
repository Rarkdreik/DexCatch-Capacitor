import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  // Redirigir a 'login' si la ruta está vacía
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Ruta de inicio de sesión
  { path: 'login', loadChildren: () => import('./pages/login_signin/login/login.module').then( m => m.LoginPageModule) },

  // Ruta de registro
  { path: 'signin', loadChildren: () => import('./pages/login_signin/signin/signin.module').then( m => m.SigninPageModule) },

  // Otras rutas protegidas
  { path: 'iniregion', loadChildren: () => import('./pages/iniregion/iniregion.module').then( m => m.IniregionPageModule) },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule), canActivate: [authGuard] },
  { path: 'modal-pokeball', loadChildren: () => import('./pages/modal-pokeball/modal-pokeball.module').then( m => m.ModalPokeballPageModule), canActivate: [authGuard] },
  { path: 'team', loadChildren: () => import('./pages/team/team.module').then( m => m.TeamPageModule), canActivate: [authGuard] },
  { path: 'poke-center', loadChildren: () => import('./pages/poke-center/poke-center.module').then( m => m.PokeCenterPageModule), canActivate: [authGuard] },
  { path: 'captura/:id', loadChildren: () => import('./pages/catch/catch.module').then( m => m.CatchPageModule), canActivate: [authGuard] },
  { path: 'modal2/:id', loadChildren: () => import('./pages/modal-description/modal-description.module').then( m => m.ModalDescriptionPageModule), canActivate: [authGuard] },
  { path: 'modal', loadChildren: () => import('./pages/modal/modal.module').then( m => m.ModalPageModule), canActivate: [authGuard] },
  { path: 'pokedex', loadChildren: () => import('./pages/pokedex/pokedex.module').then( m => m.PokedexPageModule), canActivate: [authGuard] },
  // { path: 'tabs', loadChildren: () => import('./pages/menu/tabs/tabs.module').then(m => m.TabsPageModule), canActivate: [authGuard] },


  // Ruta por defecto si la URL no coincide con ninguna ruta definida
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'shop',
    loadChildren: () => import('./pages/shop/shop.module').then( m => m.ShopPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
