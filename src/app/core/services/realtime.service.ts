import { Injectable, signal } from '@angular/core';
import { API_BASE_URL } from '../config/api.config';
import { TokenService } from './token.service';

export type RealtimePayload =
  | { event: 'connected'; data: any }
  | { event: 'message:new'; data: any }
  | { event: 'message:read'; data: any }
  | { event: 'error'; data: any };

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  connected = signal(false);
  activeChannelId = signal<number | null>(null);
  userId = signal<string | null>(null);

  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private readonly listeners = new Set<(payload: RealtimePayload) => void>();

  constructor(private readonly tokenService: TokenService) {}

  connect() {
    const token = this.tokenService.getAccessToken();
    if (!token) return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.userId.set(this.parseUserId(token));
    const url = this.buildWsUrl(token);
    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', () => {
      this.connected.set(true);
      this.reconnectAttempt = 0;
    });

    this.socket.addEventListener('close', () => {
      this.connected.set(false);
      this.socket = null;
      this.scheduleReconnect();
    });

    this.socket.addEventListener('error', () => {
      this.connected.set(false);
    });

    this.socket.addEventListener('message', (ev) => {
      try {
        const payload = JSON.parse(String(ev.data)) as RealtimePayload;
        this.listeners.forEach((fn) => fn(payload));
      } catch {
        // ignore
      }
    });
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempt = 0;
    this.connected.set(false);
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // ignore
      }
      this.socket = null;
    }
  }

  subscribe(fn: (payload: RealtimePayload) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const token = this.tokenService.getAccessToken();
    if (!token) return;
    const delay = Math.min(15000, 500 * Math.pow(2, this.reconnectAttempt));
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private buildWsUrl(token: string) {
    // API_BASE_URL: http://host:3300/api/v1 -> ws://host:3300/ws
    const wsBase = API_BASE_URL.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:').replace(/\/api\/v1\/?$/, '');
    const params = new URLSearchParams({ token });
    return `${wsBase}/ws?${params.toString()}`;
  }

  private parseUserId(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const json = decodeURIComponent(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      const payload = JSON.parse(json);
      return typeof payload?.sub === 'string' ? payload.sub : null;
    } catch {
      return null;
    }
  }
}
