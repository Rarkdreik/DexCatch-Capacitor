import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  //const toastr = inject(ToastService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    console.log("Access granted");

    return true;
  } else {
    console.log("You dont have permission to access this page...!");
    router.navigate(['/login']);
    
    return false;
  }
};
