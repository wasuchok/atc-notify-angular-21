import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LoadingService } from '../../../core/services/loading.service';
import { SwalService } from '../../../shared/swal/swal.service';

type Team = {
  id: string;
  name: string;
  created_at: string | null;
  _count?: { user_roles?: number };
};

type UserLite = {
  uuid: string;
  email: string;
  display_name: string;
  role: string;
  branch: string | null;
  team: string | null;
};

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.html',
  styleUrl: './teams.css',
})
export class TeamsComponent {
  teams = signal<Team[]>([]);
  loading = signal(false);
  query = signal('');

  showCreateModal = signal(false);
  createName = signal('');
  showEditModal = signal(false);
  editName = signal('');
  selectedTeam = signal<Team | null>(null);

  membersLoading = signal(false);
  membersSaving = signal(false);
  membersQuery = signal('');
  users = signal<UserLite[]>([]);
  selectedUserIds = signal<Set<string>>(new Set());

  constructor(
    private readonly api: ApiService,
    private readonly loadingService: LoadingService,
    private readonly swal: SwalService
  ) {
    let previousOverflow = '';
    effect((onCleanup) => {
      if (typeof document === 'undefined') return;
      const open = this.showCreateModal() || this.showEditModal();
      if (open) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = previousOverflow || '';
      }

      const onKeyDown = (event: KeyboardEvent) => {
        if (!this.showCreateModal() && !this.showEditModal()) return;
        if (event.key === 'Escape') this.closeOverlays();
      };

      window.addEventListener('keydown', onKeyDown);
      onCleanup(() => window.removeEventListener('keydown', onKeyDown));
    });
  }

  async ngOnInit() {
    await this.fetchTeams();
  }

  async fetchTeams() {
    this.loading.set(true);
    this.loadingService.show();
    try {
      const res = await firstValueFrom(this.api.getPrivate<{ data: Team[] }>('/role'));
      this.teams.set(res.data || []);
    } catch (err: any) {
      const message = err?.error?.message || 'ไม่สามารถดึงข้อมูลทีมได้';
      this.swal.error('แจ้งเตือน', message);
    } finally {
      this.loading.set(false);
      this.loadingService.hide();
    }
  }

  get filteredTeams() {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.teams();
    return (this.teams() || []).filter((t) => t.name.toLowerCase().includes(q));
  }

  memberCount(team: Team) {
    return team._count?.user_roles ?? 0;
  }

  openCreate() {
    this.createName.set('');
    this.showCreateModal.set(true);
  }

  openEdit(team: Team) {
    this.selectedTeam.set(team);
    this.editName.set(team.name || '');
    this.showEditModal.set(true);
  }

  closeOverlays() {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
  }

  async createTeam() {
    const name = this.createName().trim();
    if (!name) {
      await this.swal.warning('แจ้งเตือน', 'กรุณาระบุชื่อทีม');
      return;
    }

    this.loadingService.show();
    try {
      await firstValueFrom(this.api.postPrivate('/role/create', { name }));
      this.showCreateModal.set(false);
      await this.fetchTeams();
      const created = (this.teams() || []).find((t) => t.name === name) || null;
      if (created) {
        await this.selectTeam(created);
      }
      await this.swal.success('สำเร็จ', 'สร้างทีมเรียบร้อยแล้ว');
    } catch (err: any) {
      const message = err?.error?.message || 'ไม่สามารถสร้างทีมได้';
      await this.swal.error('ไม่สำเร็จ', message);
    } finally {
      this.loadingService.hide();
    }
  }

  async saveEdit() {
    const team = this.selectedTeam();
    if (!team) return;
    const name = this.editName().trim();
    if (!name) {
      await this.swal.warning('แจ้งเตือน', 'กรุณาระบุชื่อทีม');
      return;
    }

    this.loadingService.show();
    try {
      await firstValueFrom(this.api.putPrivate(`/role/${team.id}`, { name }));
      this.showEditModal.set(false);
      await this.fetchTeams();
      const next = (this.teams() || []).find((t) => t.id === team.id) || null;
      this.selectedTeam.set(next);
      await this.swal.success('สำเร็จ', 'บันทึกการแก้ไขเรียบร้อยแล้ว');
    } catch (err: any) {
      const message = err?.error?.message || 'ไม่สามารถแก้ไขทีมได้';
      await this.swal.error('ไม่สำเร็จ', message);
    } finally {
      this.loadingService.hide();
    }
  }

  async confirmDelete(team: Team) {
    const ok = await this.swal.question('ยืนยันการลบ', `ต้องการลบทีม "${team.name}" ใช่หรือไม่?`);
    if (!ok) return;

    this.loadingService.show();
    try {
      await firstValueFrom(this.api.deletePrivate(`/role/${team.id}`));
      if (this.selectedTeam()?.id === team.id) {
        this.selectedTeam.set(null);
        this.users.set([]);
        this.selectedUserIds.set(new Set());
      }
      await this.fetchTeams();
      await this.swal.success('สำเร็จ', 'ลบทีมเรียบร้อยแล้ว');
    } catch (err: any) {
      const message = err?.error?.message || 'ไม่สามารถลบทีมได้';
      await this.swal.error('ไม่สำเร็จ', message);
    } finally {
      this.loadingService.hide();
    }
  }

  async selectTeam(team: Team) {
    this.selectedTeam.set(team);
    this.membersQuery.set('');
    this.users.set([]);
    this.selectedUserIds.set(new Set());
    this.membersLoading.set(true);
    this.loadingService.show();

    try {
      const [roleUsersRes, usersRes] = await Promise.all([
        firstValueFrom(
          this.api.getPrivate<{
            data: { role: { id: string; name: string }; users: UserLite[] };
          }>(`/role/${team.id}/users`)
        ),
        firstValueFrom(
          this.api.getPrivate<{
            data: Array<{
              uuid: string;
              email: string;
              display_name: string;
              role: string;
              branch: string | null;
              team: string | null;
            }>;
          }>('/users', { params: { page: 1, limit: 1000 } })
        ),
      ]);

      const members = roleUsersRes.data?.users || [];
      const selected = new Set(members.map((u) => u.uuid));
      this.selectedUserIds.set(selected);

      const allUsers = usersRes.data || [];
      this.users.set(allUsers);
    } catch (err: any) {
      const message = err?.error?.message || 'ไม่สามารถดึงข้อมูลสมาชิกทีมได้';
      await this.swal.error('ไม่สำเร็จ', message);
      this.selectedTeam.set(null);
    } finally {
      this.membersLoading.set(false);
      this.loadingService.hide();
    }
  }

  get filteredUsers() {
    const q = this.membersQuery().trim().toLowerCase();
    const users = this.users();
    if (!q) return users;
    return users.filter((u) => {
      const name = (u.display_name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }

  isSelected(uuid: string) {
    return this.selectedUserIds().has(uuid);
  }

  toggleUser(uuid: string, value: boolean) {
    const next = new Set(this.selectedUserIds());
    if (value) next.add(uuid);
    else next.delete(uuid);
    this.selectedUserIds.set(next);
  }

  setAll(value: boolean) {
    if (!value) {
      this.selectedUserIds.set(new Set());
      return;
    }
    this.selectedUserIds.set(new Set((this.users() || []).map((u) => u.uuid)));
  }

  async saveMembers() {
    const team = this.selectedTeam();
    if (!team) return;
    if (this.membersSaving()) return;

    const userUuids = Array.from(this.selectedUserIds());
    this.membersSaving.set(true);
    this.loadingService.show();

    try {
      await firstValueFrom(this.api.putPrivate(`/role/${team.id}/users`, { user_uuids: userUuids }));
      await this.fetchTeams();
      const next = (this.teams() || []).find((t) => t.id === team.id) || team;
      this.selectedTeam.set(next);
      await this.swal.success('สำเร็จ', 'บันทึกสมาชิกทีมเรียบร้อยแล้ว');
    } catch (err: any) {
      const message = err?.error?.message || 'ไม่สามารถบันทึกสมาชิกทีมได้';
      await this.swal.error('ไม่สำเร็จ', message);
    } finally {
      this.membersSaving.set(false);
      this.loadingService.hide();
    }
  }

  thaiDate(iso: string | null) {
    if (!iso) return '-';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  userInitial(name: string) {
    const raw = String(name || '').trim();
    if (!raw) return '?';
    const parts = raw.split(/\s+/).filter(Boolean);
    const first = (parts[0] || '').trim();
    return (first[0] || '?').toUpperCase();
  }

  userAvatarColor(seed: string) {
    const raw = String(seed || '');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
    }
    const hue = hash % 360;
    return `hsl(${hue} 70% 45%)`;
  }
}
