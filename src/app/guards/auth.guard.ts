import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  //const toastr = inject(ToastService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  if (authService.isLoggedIn()) {
    logger.debug('authGuard', 'Acceso permitido', { url: state.url });

    return true;
  } else {
    logger.warn('authGuard', 'Acceso bloqueado por sesion no iniciada', { url: state.url });
    router.navigate(['/login']);
    
    return false;
  }
};
