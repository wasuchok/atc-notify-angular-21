import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { TokenService } from '../services/token.service';

export const adminGuard: CanMatchFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const accessToken = tokenService.getAccessToken();
  if (!accessToken) return router.createUrlTree(['/login']);

  if (tokenService.isAdmin()) return true;

  return router.createUrlTree(['/admin/chat']);
};

