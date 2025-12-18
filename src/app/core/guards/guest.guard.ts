import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { TokenService } from '../services/token.service';

export const guestGuard: CanMatchFn = () => {
  const tokenService = inject(TokenService);
  const apiService = inject(ApiService);
  const router = inject(Router);

  const toHome = () =>
    tokenService.isAdmin()
      ? router.createUrlTree(['/admin/dashboard'])
      : router.createUrlTree(['/admin/chat']);

  const accessToken = tokenService.getAccessToken();
  if (accessToken) return toHome();

  const refreshToken = tokenService.getRefreshToken();
  if (!refreshToken) return true;

  return apiService.refreshToken().pipe(
    map(res => {
      const pair = ApiService.extractTokenPair(res);
      tokenService.setTokens(pair);
      return toHome();
    }),
    catchError(() => {
      tokenService.clearTokens();
      return of(true);
    })
  );
};
