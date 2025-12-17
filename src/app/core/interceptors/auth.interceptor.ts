import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { REFRESH_TOKEN_ENDPOINT } from '../config/api.config';
import { ApiService } from '../services/api.service';
import { TokenService } from '../services/token.service';

/**
 * Attaches access token and auto-refreshes on 401 using refresh token.
 * Skips refresh loop when hitting refresh endpoint itself.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const apiService = inject(ApiService);

  const isRefreshCall = req.url.includes(REFRESH_TOKEN_ENDPOINT);
  const accessToken = tokenService.getAccessToken();
  const refreshToken = tokenService.getRefreshToken();

  const authReq = accessToken && !req.headers.has('Authorization')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  // ถ้า access token ไม่มีแต่มี refresh token ให้รีเฟรชก่อนยิงปลายทาง
  if (!accessToken && refreshToken && !isRefreshCall) {
    return apiService.refreshToken().pipe(
      switchMap(tokens => {
        const pair = ApiService.extractTokenPair(tokens);
        tokenService.setTokens(pair);
        const retryReq = authReq.clone({
          setHeaders: { Authorization: `Bearer ${pair.accessToken}` }
        });
        return next(retryReq);
      }),
      catchError(refreshErr => {
        tokenService.clearTokens();
        return throwError(() => refreshErr);
      })
    );
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshCall) {
        if (!refreshToken) {
          tokenService.clearTokens();
          return throwError(() => error);
        }

        // Attempt refresh then retry original request
        return apiService.refreshToken().pipe(
          switchMap(tokens => {
            const pair = ApiService.extractTokenPair(tokens);
            tokenService.setTokens(pair);
            const retryReq = authReq.clone({
              setHeaders: { Authorization: `Bearer ${pair.accessToken}` }
            });
            return next(retryReq);
          }),
          catchError(refreshErr => {
            tokenService.clearTokens();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
