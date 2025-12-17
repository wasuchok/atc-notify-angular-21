import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, REFRESH_TOKEN_ENDPOINT } from '../config/api.config';
import { TokenService } from './token.service';

type RequestOptions = {
  params?: HttpParams | Record<string, string | number | boolean>;
  headers?: HttpHeaders | Record<string, string>;
  withCredentials?: boolean;
};

type RefreshTokenResponse =
  | { accessToken: string; refreshToken?: string }
  | { data: { accessToken: string; refreshToken?: string } };

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = API_BASE_URL;

  constructor(private readonly http: HttpClient, private readonly tokenService: TokenService) {}

  // Public endpoints
  getPublic<T>(endpoint: string, options?: RequestOptions) {
    return this.http.get<T>(this.buildUrl(endpoint), this.normalizeOptions(options));
  }

  postPublic<T>(endpoint: string, body: any, options?: RequestOptions) {
    return this.http.post<T>(this.buildUrl(endpoint), body, this.normalizeOptions(options));
  }

  putPublic<T>(endpoint: string, body: any, options?: RequestOptions) {
    return this.http.put<T>(this.buildUrl(endpoint), body, this.normalizeOptions(options));
  }

  deletePublic<T>(endpoint: string, options?: RequestOptions) {
    return this.http.delete<T>(this.buildUrl(endpoint), this.normalizeOptions(options));
  }

  // Private endpoints (auto attach Authorization header)
  getPrivate<T>(endpoint: string, options?: RequestOptions) {
    return this.http.get<T>(this.buildUrl(endpoint), this.withAuth(options));
  }

  postPrivate<T>(endpoint: string, body: any, options?: RequestOptions) {
    return this.http.post<T>(this.buildUrl(endpoint), body, this.withAuth(options));
  }

  putPrivate<T>(endpoint: string, body: any, options?: RequestOptions) {
    return this.http.put<T>(this.buildUrl(endpoint), body, this.withAuth(options));
  }

  deletePrivate<T>(endpoint: string, options?: RequestOptions) {
    return this.http.delete<T>(this.buildUrl(endpoint), this.withAuth(options));
  }

  /**
   * Call backend refresh-token endpoint using stored refresh token.
   * Returns new token pair (if backend provides it).
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post<RefreshTokenResponse>(
      this.buildUrl(REFRESH_TOKEN_ENDPOINT),
      { refreshToken },
      this.normalizeOptions({ withCredentials: true })
    );
  }

  private buildUrl(endpoint: string) {
    return endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
  }

  private withAuth(options?: RequestOptions) {
    const token = this.tokenService.getAccessToken();
    const normalized = this.normalizeOptions(options);
    if (!token) return normalized;

    const existing = normalized.headers instanceof HttpHeaders
      ? normalized.headers
      : new HttpHeaders(normalized.headers || {});

    const headers = existing.set('Authorization', `Bearer ${token}`);
    return { ...normalized, headers };
  }

  private normalizeOptions(options?: RequestOptions) {
    const normalized = options || {};
    // HttpClient accepts plain objects for params; leave as-is.
    if (normalized.headers instanceof HttpHeaders || normalized.headers === undefined) {
      return normalized;
    }
    return { ...normalized, headers: new HttpHeaders(normalized.headers) };
  }

  static extractTokenPair(res: RefreshTokenResponse): { accessToken: string; refreshToken?: string } {
    if ('data' in res) return { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken };
    return { accessToken: res.accessToken, refreshToken: res.refreshToken };
  }
}
