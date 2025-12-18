import { Injectable } from '@angular/core';

interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

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

  getAccessTokenPayload(): JwtPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
      const json = this.base64UrlDecode(parts[1]);
      const payload = JSON.parse(json) as JwtPayload;
      return payload && typeof payload === 'object' ? payload : null;
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    const role = this.getAccessTokenPayload()?.role;
    return typeof role === 'string' && role.trim() ? role.trim().toLowerCase() : null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
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

  private base64UrlDecode(input: string): string {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
    const decoded = atob(base64 + pad);
    const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
}
