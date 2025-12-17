import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { TokenService } from '../services/token.service';

export const authGuard: CanMatchFn = (_route, segments) => {
  const tokenService = inject(TokenService);
  const apiService = inject(ApiService);
  const router = inject(Router);

  const accessToken = tokenService.getAccessToken();
  if (accessToken) return true;

  const refreshToken = tokenService.getRefreshToken();
  const attemptedUrl = `/${segments.map(s => s.path).join('/')}`;

  const toLogin = (): UrlTree =>
    router.createUrlTree(['/login'], { queryParams: { returnUrl: attemptedUrl } });

  if (!refreshToken) return toLogin();

  return apiService.refreshToken().pipe(
    map(res => {
      const pair = ApiService.extractTokenPair(res);
      tokenService.setTokens(pair);
      return true;
    }),
    catchError(() => {
      tokenService.clearTokens();
      return of(toLogin());
    })
  );
};

