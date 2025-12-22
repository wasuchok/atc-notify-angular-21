import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiService } from '../../../core/services/api.service';
import { JoinedChannelsService } from '../../../core/services/joined-channels.service';
import { LoadingService } from '../../../core/services/loading.service';
import { RealtimePayload, RealtimeService } from '../../../core/services/realtime.service';
import { SwalService } from '../../../shared/swal/swal.service';

type ChatMessage = {
  id: number;
  channel_id: number;
  type: string;
  content: string;
  image_url: string | null;
  sender_uuid: string;
  sender_name: string;
  created_at: string;
  read_by?: string[];
};

type MessagesResponse = {
  data: ChatMessage[];
  meta?: { nextCursor: number | null; hasMore: boolean };
};

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  template: `
    <div class="h-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-sm font-bold text-slate-900 truncate">{{ channelName() }}</p>
          <p class="text-xs text-slate-500 truncate">{{ channelMeta() }}</p>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <div class="hidden sm:flex items-center -space-x-2">
            <div *ngFor="let p of participants().slice(0, 5)"
              class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center ring-2 ring-white border border-slate-300"
              [title]="p.name">
              {{ p.initial }}
            </div>
            <div *ngIf="participants().length > 5"
              class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center ring-2 ring-white border border-slate-200"
              [title]="'อีก ' + (participants().length - 5) + ' คน'">
              +{{ participants().length - 5 }}
            </div>
          </div>

          <button type="button" (click)="fetchMessages()"
            class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-3-6.708M21 3v6h-6" />
            </svg>
            รีเฟรช
          </button>
        </div>
      </div>

      <div #scrollEl class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50">
        <div *ngIf="loadingOlder()" class="py-2 text-center text-[11px] text-slate-500">
          กำลังโหลดข้อความเก่า...
        </div>
        <div *ngIf="messages().length === 0" class="py-10 text-center text-slate-500 text-sm">
          ยังไม่มีข้อความ
        </div>

        <div *ngFor="let m of messages()" class="flex gap-3" [class.justify-end]="isMe(m)">
          @if (!isMe(m)) {
            <div class="w-9 h-9 rounded-2xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center ring-1 ring-slate-300 flex-shrink-0">
              {{ (m.sender_name || '?').trim().slice(0,1) }}
            </div>
          }

          <div class="min-w-0 max-w-[720px]">
            <div class="flex items-center gap-2" [class.justify-end]="isMe(m)">
              <p *ngIf="!isMe(m)" class="text-xs font-semibold text-slate-900 truncate max-w-[220px]">{{ m.sender_name }}</p>
              <span class="text-[11px] text-slate-400 tabular-nums">{{ thaiTime(m.created_at) }}</span>
              <span *ngIf="m.type && m.type !== 'text'" class="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-700 font-semibold">
                {{ m.type }}
              </span>
            </div>

            <div class="mt-1">
              <img *ngIf="m.type === 'image' && m.image_url" [src]="resolveMediaUrl(m.image_url)"
                class="max-w-[360px] rounded-2xl border border-slate-200 bg-white cursor-zoom-in hover:opacity-95 transition-opacity"
                [class.ml-auto]="isMe(m)"
                (click)="openImage(resolveMediaUrl(m.image_url))"
                (load)="onMediaLoaded()" />

              <div *ngIf="m.content"
                class="inline-block rounded-2xl px-4 py-3 border text-sm whitespace-pre-wrap break-words"
                [class.bg-white]="!isMe(m)"
                [class.border-slate-200]="!isMe(m)"
                [class.text-slate-700]="!isMe(m)"
                [class.bg-slate-900]="isMe(m)"
                [class.border-slate-900]="isMe(m)"
                [class.text-white]="isMe(m)"
                [class.ml-auto]="isMe(m)">
                {{ m.content }}
              </div>
            </div>
          </div>

          @if (isMe(m)) {
            <div class="w-9 h-9 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center ring-1 ring-slate-800 flex-shrink-0">
              {{ myInitial() }}
            </div>
          }
        </div>
      </div>

      <form class="p-4 border-t border-slate-100 bg-white" (submit)="sendMessage($event)">
        <div class="flex items-end gap-2">
          <textarea #messageInput [(ngModel)]="draft" name="draft" rows="1"
            (keydown.enter)="onEnter($event)"
            placeholder="พิมพ์ข้อความ..."
            class="flex-1 resize-none px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-200 outline-none transition-all text-sm"
            [disabled]="sending()"></textarea>
          <button type="submit" [disabled]="sending() || !draft.trim()"
            class="inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
            ส่ง
          </button>
        </div>
        <p class="mt-2 text-[11px] text-slate-500">Enter เพื่อส่ง • Shift+Enter เพื่อขึ้นบรรทัดใหม่</p>
      </form>
    </div>

    @if (lightboxUrl()) {
      <div class="fixed inset-0 z-[4500]">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="closeImage()"></div>
        <div class="absolute inset-0 flex items-center justify-center p-4">
          <div class="w-full max-w-5xl">
            <div class="flex justify-end mb-3">
              <div class="flex items-center gap-2">
                <a [href]="lightboxUrl()!" target="_blank" rel="noopener"
                  class="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
                  title="เปิดในแท็บใหม่">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 3h7v7" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 14L21 3" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 14v7H3V3h7" />
                  </svg>
                </a>
                <button type="button" (click)="closeImage()"
                  class="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
                  title="ปิด (Esc)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="bg-black/20 rounded-2xl border border-white/10 p-2 shadow-2xl">
              <img [src]="lightboxUrl()!" class="max-h-[82vh] w-auto mx-auto rounded-xl bg-white" (load)="onMediaLoaded()" />
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ChatRoomComponent {
@ViewChild('scrollEl') scrollEl?: ElementRef<HTMLDivElement>;
@ViewChild('messageInput') messageInput?: ElementRef<HTMLTextAreaElement>;

  channelId = signal<number | null>(null);
  messages = signal<ChatMessage[]>([]);
  sending = signal(false);
  loadingOlder = signal(false);
  hasMore = signal(false);
  nextCursor = signal<number | null>(null);
  draft = '';
  private unsubscribeRealtime: (() => void) | null = null;
  private routeSub: Subscription | null = null;
  private removeScrollListener: (() => void) | null = null;
  private readonly messageIds = new Set<number>();
  lightboxUrl = signal<string | null>(null);
  private pendingScrollFrames = 0;
  private scrollRaf: number | null = null;
  private initialAutoScroll = false;
  private initialAutoScrollTimer: any = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly joinedChannels: JoinedChannelsService,
    private readonly loadingService: LoadingService,
    private readonly realtime: RealtimeService,
    private readonly swal: SwalService
  ) {}

  async ngOnInit() {
    if (this.joinedChannels.channels().length === 0) {
      await this.joinedChannels.refresh().catch(() => null);
    }

    this.unsubscribeRealtime = this.realtime.subscribe((p) => this.onRealtime(p));

    this.routeSub = this.route.paramMap.subscribe((pm) => {
      const raw = pm.get('id');
      const id = raw ? Number(raw) : NaN;
      if (Number.isNaN(id)) return;

      if (this.channelId() === id) return;
      this.channelId.set(id);
      this.realtime.activeChannelId.set(id);
      this.messages.set([]);
      this.messageIds.clear();
      this.hasMore.set(false);
      this.nextCursor.set(null);
      void this.fetchMessages();
    });
  }

  ngOnDestroy() {
    if (this.unsubscribeRealtime) this.unsubscribeRealtime();
    this.unsubscribeRealtime = null;
    if (this.routeSub) this.routeSub.unsubscribe();
    this.routeSub = null;
    if (this.removeScrollListener) this.removeScrollListener();
    this.removeScrollListener = null;
    if (this.scrollRaf) cancelAnimationFrame(this.scrollRaf);
    this.scrollRaf = null;
    this.pendingScrollFrames = 0;
    if (this.initialAutoScrollTimer) clearTimeout(this.initialAutoScrollTimer);
    this.initialAutoScrollTimer = null;
  }

  channelName() {
    const id = this.channelId();
    if (!id) return 'ห้องแชท';
    return this.joinedChannels.getById(id)?.name || `ห้องแชท #${id}`;
  }

  channelMeta() {
    const id = this.channelId();
    if (!id) return '';
    const channel = this.joinedChannels.getById(id);
    const unread = channel?.unread_count ?? 0;
    if (unread > 0) return `${unread} ข้อความใหม่`;
    return 'ข้อความล่าสุด';
  }

  isMe(message: ChatMessage) {
    const me = this.realtime.userId();
    if (!me) return false;
    return message.sender_uuid === me;
  }

  myInitial() {
    return 'A';
  }

  participants() {
    const seen = new Set<string>();
    const list: Array<{ uuid: string; name: string; initial: string }> = [];
    const messages = this.messages();
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      const uuid = m.sender_uuid || '';
      if (!uuid || seen.has(uuid)) continue;
      seen.add(uuid);
      const name = (m.sender_name || 'ไม่ระบุ').trim();
      list.push({ uuid, name, initial: (name[0] || '?').toUpperCase() });
    }
    return list;
  }

  async fetchMessages() {
    const id = this.channelId();
    if (!id) return;

    this.loadingService.show();
    try {
      const res = await firstValueFrom(
        this.api.getPrivate<MessagesResponse>(`/messages/${id}`, { params: { limit: 50 }, withCredentials: true })
      );
      const list = res.data || [];
      this.messageIds.clear();
      for (const m of list) this.messageIds.add(m.id);
      this.messages.set(list);
      this.nextCursor.set(res.meta?.nextCursor ?? null);
      this.hasMore.set(Boolean(res.meta?.hasMore));
      this.markInitialAutoScroll();
      this.scrollToBottom(true);
      await this.joinedChannels.refresh().catch(() => null);
      this.ensureScrollListener();
    } catch (err: any) {
      const message = err?.error?.message || 'ไม่สามารถดึงข้อความได้';
      this.swal.error('แจ้งเตือน', message);
    } finally {
      this.loadingService.hide();
    }
  }

  private ensureScrollListener() {
    if (this.removeScrollListener) return;
    const el = this.scrollEl?.nativeElement;
    if (!el) return;

    const handler = () => {
      if (el.scrollTop <= 40) {
        void this.loadOlder();
      }
    };
    el.addEventListener('scroll', handler, { passive: true });
    this.removeScrollListener = () => el.removeEventListener('scroll', handler as any);
  }

  async loadOlder() {
    const id = this.channelId();
    if (!id) return;
    if (this.loadingOlder()) return;
    if (!this.hasMore()) return;
    const cursor = this.nextCursor();
    if (!cursor) return;

    const el = this.scrollEl?.nativeElement;
    const prevScrollHeight = el?.scrollHeight ?? 0;
    const prevScrollTop = el?.scrollTop ?? 0;

    this.loadingOlder.set(true);
    try {
      const res = await firstValueFrom(
        this.api.getPrivate<MessagesResponse>(`/messages/${id}`, {
          params: { limit: 50, cursor },
          withCredentials: true,
        })
      );

      const older = (res.data || []).filter((m) => !this.messageIds.has(m.id));
      if (older.length > 0) {
        for (const m of older) this.messageIds.add(m.id);
        this.messages.update((prev) => [...older, ...prev]);
      }

      this.nextCursor.set(res.meta?.nextCursor ?? null);
      this.hasMore.set(Boolean(res.meta?.hasMore));

      // Keep the current viewport anchored when prepending.
      if (el) {
        setTimeout(() => {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
        }, 0);
      }
    } catch {
      // ignore
    } finally {
      this.loadingOlder.set(false);
    }
  }

  async sendMessage(event: Event) {
    event.preventDefault();
    const id = this.channelId();
    const content = this.draft.trim();
    if (!id || !content) return;

    this.sending.set(true);
    try {
      await firstValueFrom(
        this.api.postPrivate('/messages', { channel_id: id, content, type: 'text' }, { withCredentials: true })
      );
      this.draft = '';
      // rely on realtime broadcast; fallback refresh if websocket disconnected
      if (!this.realtime.connected()) {
        await this.fetchMessages();
      }
    } catch (err: any) {
      const message = err?.error?.message || 'ไม่สามารถส่งข้อความได้';
      this.swal.error('แจ้งเตือน', message);
    } finally {
      this.sending.set(false);
      this.focusMessageInput();
    }
  }

  onEnter(event: Event) {
    const keyboard = event as KeyboardEvent;
    if (keyboard.key !== 'Enter') return;
    if (keyboard.shiftKey) return;
    keyboard.preventDefault();
    void this.sendMessage(event);
  }

  scrollToBottom(): void;
  scrollToBottom(force: boolean): void;
  scrollToBottom(force = false) {
    const el = this.scrollEl?.nativeElement;
    if (!el) return;
    if (!force && !this.isNearBottom(el)) return;
    this.scheduleScrollToBottom(6);
  }

  private scheduleScrollToBottom(frames: number) {
    this.pendingScrollFrames = Math.max(this.pendingScrollFrames, frames);
    if (this.scrollRaf) return;
    const tick = () => {
      const el = this.scrollEl?.nativeElement;
      if (!el) {
        this.scrollRaf = null;
        this.pendingScrollFrames = 0;
        return;
      }
      el.scrollTop = el.scrollHeight;
      this.pendingScrollFrames -= 1;
      if (this.pendingScrollFrames > 0) {
        this.scrollRaf = requestAnimationFrame(tick);
      } else {
        this.scrollRaf = null;
      }
    };
    this.scrollRaf = requestAnimationFrame(tick);
  }

  private isNearBottom(el: HTMLDivElement, thresholdPx = 140) {
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance <= thresholdPx;
  }

  private markInitialAutoScroll() {
    this.initialAutoScroll = true;
    if (this.initialAutoScrollTimer) clearTimeout(this.initialAutoScrollTimer);
    this.initialAutoScrollTimer = setTimeout(() => {
      this.initialAutoScroll = false;
    }, 1200);
  }

  private focusMessageInput() {
    const input = this.messageInput?.nativeElement;
    if (!input) return;
    setTimeout(() => input.focus(), 0);
  }

  onMediaLoaded() {
    const el = this.scrollEl?.nativeElement;
    if (!el) return;
    if (this.initialAutoScroll || this.isNearBottom(el)) {
      this.scheduleScrollToBottom(4);
    }
  }

  openImage(url: string) {
    const next = String(url || '').trim();
    if (!next) return;
    this.lightboxUrl.set(next);
  }

  closeImage() {
    this.lightboxUrl.set(null);
  }

  onDocumentKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    if (!this.lightboxUrl()) return;
    event.preventDefault();
    this.closeImage();
  }

  private async markReadIfNeeded(channelId: number, senderUuid?: string) {
    const me = this.realtime.userId();
    if (me && senderUuid && senderUuid === me) return;
    try {
      await firstValueFrom(this.api.postPrivate(`/messages/${channelId}/read`, {}, { withCredentials: true }));
    } catch {
      // ignore
    }
  }

  private onRealtime(payload: RealtimePayload) {
    const currentChannelId = this.channelId();
    if (!currentChannelId) return;

    if (payload.event === 'message:new') {
      const el = this.scrollEl?.nativeElement;
      const shouldAutoScroll = Boolean(el && this.isNearBottom(el)) || false;
      const data: any = payload.data || {};
      const channelId = Number(data.channel_id);
      if (channelId !== currentChannelId) return;
      const messageId = Number(data.id);
      if (!Number.isInteger(messageId) || this.messageIds.has(messageId)) return;

      const next: ChatMessage = {
        id: messageId,
        channel_id: channelId,
        type: String(data.type || 'text'),
        content: String(data.content || ''),
        image_url: data.image_url || null,
        sender_uuid: String(data.sender_uuid || ''),
        sender_name: String(data.sender_name || 'ไม่ระบุ'),
        created_at: String(data.created_at || new Date().toISOString()),
        read_by: Array.isArray(data.read_by) ? data.read_by : [],
      };

      this.messageIds.add(next.id);
      this.messages.update((prev) => [...prev, next]);
      this.scrollToBottom(shouldAutoScroll || this.isMe(next));
      void this.markReadIfNeeded(channelId, next.sender_uuid);
      return;
    }

    if (payload.event === 'message:read') {
      const data: any = payload.data || {};
      const messageIds = Array.isArray(data.messageIds) ? data.messageIds.map((id: any) => Number(id)).filter((n: number) => Number.isInteger(n)) : [];
      const userId = typeof data.userId === 'string' ? data.userId : null;
      if (!userId || messageIds.length === 0) return;

      this.messages.update((prev) =>
        prev.map((m) => {
          if (!messageIds.includes(m.id)) return m;
          const readBy = new Set([...(m.read_by || []), userId]);
          return { ...m, read_by: Array.from(readBy) };
        })
      );
    }
  }

  thaiTime(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  resolveMediaUrl(url: string | null) {
    if (!url) return '';
    const raw = String(url).trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    if (raw.startsWith('/')) return `${base}${raw}`;
    return `${base}/${raw}`;
  }
}
