import { Injectable } from '@angular/core';

interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly accessKey = 'access_token';
  private readonly refreshKey = 'refresh_token';

  setTokens(tokens: TokenPair) {
    // Access token: short-lived (default 1 hour)
    this.setCookie(this.accessKey, tokens.accessToken, 60 * 60);
    // Refresh token: longer (default 7 days)
    if (tokens.refreshToken) this.setCookie(this.refreshKey, tokens.refreshToken, 60 * 60 * 24 * 7);
  }

  getAccessToken(): string | null {
    return this.getCookie(this.accessKey);
  }

  getRefreshToken(): string | null {
    return this.getCookie(this.refreshKey);
  }

  clearTokens() {
    this.deleteCookie(this.accessKey);
    this.deleteCookie(this.refreshKey);
  }

  private setCookie(name: string, value: string, maxAgeSeconds: number) {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
  }

  private getCookie(name: string): string | null {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    const match = cookies.find(c => c.startsWith(`${encodeURIComponent(name)}=`));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  }

  private deleteCookie(name: string) {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}
