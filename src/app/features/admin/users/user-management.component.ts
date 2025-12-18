import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LoadingService } from '../../../core/services/loading.service';
import { SwalService } from '../../../shared/swal/swal.service';
import { UserCardComponent } from './user-card.component';
import { RoleOption, UserFormDrawerComponent } from './user-form-drawer.component';
import { UserPaginationComponent } from './user-pagination.component';
import { UserToolbarComponent } from './user-toolbar.component';
import { UserViewModalComponent } from './user-view-modal.component';
import { User } from './user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserToolbarComponent,
    UserCardComponent,
    UserPaginationComponent,
    UserViewModalComponent,
    UserFormDrawerComponent,
  ],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent {
  private addDrawerCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private editDrawerCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private editingUserId: string | null = null;

  constructor(
    private readonly api: ApiService,
    private readonly loadingService: LoadingService,
    private readonly swal: SwalService
  ) {
    let previousOverflow = '';
    effect((onCleanup) => {
      if (typeof document === 'undefined') return;
      const open = this.showAddModal() || this.showEditModal();
      if (open) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = previousOverflow || '';
      }

      const onKeyDown = (event: KeyboardEvent) => {
        if (!this.showAddModal() && !this.showEditModal()) return;
        if (event.key === 'Escape') this.closeModals();
      };
      window.addEventListener('keydown', onKeyDown);
      onCleanup(() => window.removeEventListener('keydown', onKeyDown));
    });
  }

  users = signal<User[]>([]);

  activeDropdownId = signal<string | null>(null);

  searchQuery = signal('');
  filterStatus = signal('');
  filterRole = signal('');

  showAddModal = signal(false);
  addDrawerVisible = signal(false);
  showEditModal = signal(false);
  editDrawerVisible = signal(false);
  showViewModal = signal(false);
  selectedUser = signal<User | null>(null);
  submitLoading = signal(false);
  formError = signal('');
  form: {
    display_name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    role: string;
    branch?: string;
    teams: string[];
  } = {
      display_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'employee',
      branch: '',
      teams: []
    };
  teamOptions = signal<RoleOption[]>([]);
  showRoleSelector = signal(false);
  roleSearchQuery = signal('');
  currentPage = signal(1);
  itemsPerPage = signal(8);
  totalItems = signal(0);
  totalPages = signal(1);
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage());
  endIndex = computed(() => {
    const total = this.totalItems();
    if (total === 0) return 0;
    return Math.min(this.startIndex() + this.itemsPerPage(), total);
  });
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));


  async fetchUsers(page = 1, limit = 10) {
    try {
      this.loadingService.show();
      const q = this.searchQuery().trim();
      const status = this.filterStatus();
      const role = this.filterRole();
      const params: Record<string, string | number> = { page, limit };
      if (q) params['q'] = q;
      if (status) params['status'] = status;
      if (role) params['role'] = role;

      const res = await firstValueFrom(
        this.api.getPrivate<{
          data: Array<{
            uuid: string;
            email: string;
            display_name: string;
            role: string;
            branch: string;
            team: string | null;
            created_at: string;
            deleted_at?: string | null;
            user_roles?: Array<{ roles?: { name: string } | null }>;
          }>;
          pagination: { page: number; limit: number; total: number; totalPages: number };
        }>('/users', {
          params
        })
      );

      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
      this.users.set(
        res.data.map((u, idx) => ({
          id: u.uuid,
          name: u.display_name,
          email: u.email,
          roles: (() => {
            const relatedRoles = (u.user_roles || [])
              .map(r => r.roles?.name)
              .filter((n): n is string => !!n);
            return relatedRoles.length ? relatedRoles : [];
          })(),
          level: u.role,
          branch: u.branch,
          team: u.team,
          status: u.deleted_at ? 'Inactive' : 'Active',
          avatarColor: colors[idx % colors.length],
          lastLogin: this.formatThaiDate(u.created_at)
        }))
      );

      this.currentPage.set(res.pagination.page);
      this.itemsPerPage.set(res.pagination.limit);
      this.totalItems.set(res.pagination.total);
      this.totalPages.set(res.pagination.totalPages);
    } catch (error) {
      console.log('Error fetchUsers: ', error);
    } finally {
      this.loadingService.hide();
    }
  }

  ngOnInit() {
    this.fetchUsers(this.currentPage(), this.itemsPerPage());
    this.fetchTeamOptions();
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.fetchUsers(1, this.itemsPerPage());
      this.searchDebounceTimer = null;
    }, 350);
  }

  onStatusChange(value: string) {
    this.filterStatus.set(value);
    this.currentPage.set(1);
    this.fetchUsers(1, this.itemsPerPage());
  }

  onRoleChange(value: string) {
    this.filterRole.set(value);
    this.currentPage.set(1);
    this.fetchUsers(1, this.itemsPerPage());
  }

  openAddModal() {
    this.form = { display_name: '', email: '', password: '', confirmPassword: '', role: 'employee', branch: '', teams: [] };
    this.formError.set('');
    this.editingUserId = null;

    if (this.addDrawerCloseTimer) {
      clearTimeout(this.addDrawerCloseTimer);
      this.addDrawerCloseTimer = null;
    }

    this.addDrawerVisible.set(true);
    this.showAddModal.set(false);
    setTimeout(() => this.showAddModal.set(true), 0);
  }

  async openEditModal(user: User) {
    this.selectedUser.set(user);
    this.editingUserId = String(user.id);
    this.formError.set('');

    if (this.editDrawerCloseTimer) {
      clearTimeout(this.editDrawerCloseTimer);
      this.editDrawerCloseTimer = null;
    }

    if ((this.teamOptions() || []).length === 0) {
      await this.fetchTeamOptions();
    }

    await this.fetchUserForEdit(String(user.id));

    this.editDrawerVisible.set(true);
    this.showEditModal.set(false);
    setTimeout(() => this.showEditModal.set(true), 0);
  }

  openViewModal(user: User) {
    this.selectedUser.set(user);
    this.showViewModal.set(true);
  }

  closeModals() {
    this.closeAddDrawer();
    this.closeEditDrawer();
    this.showEditModal.set(false);
    this.showViewModal.set(false);
    this.selectedUser.set(null);
    this.showRoleSelector.set(false);
    this.roleSearchQuery.set('');
  }

  private closeAddDrawer() {
    if (!this.addDrawerVisible()) {
      this.showAddModal.set(false);
      return;
    }

    this.showAddModal.set(false);

    if (this.addDrawerCloseTimer) clearTimeout(this.addDrawerCloseTimer);
    this.addDrawerCloseTimer = setTimeout(() => {
      this.addDrawerVisible.set(false);
      this.addDrawerCloseTimer = null;
    }, 300);
  }

  private closeEditDrawer() {
    if (!this.editDrawerVisible()) {
      this.showEditModal.set(false);
      return;
    }

    this.showEditModal.set(false);

    if (this.editDrawerCloseTimer) clearTimeout(this.editDrawerCloseTimer);
    this.editDrawerCloseTimer = setTimeout(() => {
      this.editDrawerVisible.set(false);
      this.editDrawerCloseTimer = null;
      this.editingUserId = null;
    }, 300);
  }

  toggleRoleSelector() {
    this.showRoleSelector.update(v => !v);
    this.roleSearchQuery.set('');
  }

  closeRoleSelector() {
    this.showRoleSelector.set(false);
    this.roleSearchQuery.set('');
  }



  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.fetchUsers(this.currentPage(), this.itemsPerPage());
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.fetchUsers(this.currentPage(), this.itemsPerPage());
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.fetchUsers(this.currentPage(), this.itemsPerPage());
  }

  toggleRoleDropdown(userId: string | number) {
    const key = String(userId);
    this.activeDropdownId.update(id => id === key ? null : key);
  }

  closeDropdown() {
    this.activeDropdownId.set(null);
  }

  test() { }

  roleStyle(role: string): string {
    const styles: Record<string, string> = {
      admin: 'bg-rose-50 text-rose-700 border-rose-200',
      employee: 'bg-blue-50 text-blue-700 border-blue-200',
      IT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      GA: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return styles[role] || 'bg-slate-50 text-slate-700 border-slate-200';
  }

  private formatThaiDate(date: string | number | Date): string {
    const d = new Date(date);
    return d.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async createUser() {
    if (this.submitLoading()) return;
    const payload = this.form;

    if (payload.password !== payload.confirmPassword) {
      this.swal.warning('แจ้งเตือน', 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    this.submitLoading.set(true);
    try {
      const created = await firstValueFrom(this.api.postPrivate<any>('/auth/register', {
        display_name: payload.display_name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        branch: payload.branch,
        teams: payload.teams
      }));

      const userId = created?.data?.uuid as string | undefined;
      if (userId && Array.isArray(payload.teams) && payload.teams.length > 0) {
        await firstValueFrom(this.api.putPrivate(`/users/${userId}/roles`, { role_ids: payload.teams }));
      }
      this.swal.success('สำเร็จ', 'เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว');
      this.closeAddDrawer();
      this.currentPage.set(1);
      await this.fetchUsers(1, this.itemsPerPage());
    } catch (err: any) {
      const message = err?.error?.message || 'บันทึกผู้ใช้ไม่สำเร็จ';
      this.swal.error('แจ้งเตือน', message);
    } finally {
      this.submitLoading.set(false);
    }
  }

  async updateUser() {
    if (this.submitLoading()) return;
    if (!this.editingUserId) return;

    const payload = this.form;
    if (payload.password && payload.password !== payload.confirmPassword) {
      this.swal.warning('แจ้งเตือน', 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    this.submitLoading.set(true);
    try {
      await firstValueFrom(this.api.putPrivate(`/users/${this.editingUserId}`, {
        display_name: payload.display_name,
        email: payload.email,
        role: payload.role,
        branch: payload.branch,
        password: payload.password ? payload.password : undefined
      }));

      await firstValueFrom(this.api.putPrivate(`/users/${this.editingUserId}/roles`, { role_ids: payload.teams || [] }));

      this.swal.success('สำเร็จ', 'บันทึกการแก้ไขเรียบร้อยแล้ว');
      this.closeEditDrawer();

      const roleNameById = new Map((this.teamOptions() || []).map((r) => [r.id, r.name]));
      const nextRoles = (payload.teams || []).map((id) => roleNameById.get(id) || id);
      const idToUpdate = this.editingUserId;
      this.users.update((list) =>
        list.map((u) =>
          String(u.id) === idToUpdate
            ? {
              ...u,
              name: payload.display_name,
              email: payload.email,
              level: payload.role,
              branch: payload.branch || '',
              roles: nextRoles
            }
            : u
        )
      );
      await this.fetchUsers(this.currentPage(), this.itemsPerPage());
    } catch (err: any) {
      const message = err?.error?.message || 'บันทึกการแก้ไขไม่สำเร็จ';
      this.swal.error('แจ้งเตือน', message);
    } finally {
      this.submitLoading.set(false);
    }
  }

  private async fetchTeamOptions() {
    try {
      const res = await firstValueFrom(this.api.getPrivate<any>('/role'));
      const roles: RoleOption[] =
        Array.isArray(res?.data)
          ? res.data
            .map((r: any) => ({ id: String(r?.id ?? ''), name: String(r?.name ?? '') }))
            .filter((r: RoleOption) => r.id && r.name)
          : [];
      this.teamOptions.set(roles);
    } catch (error) {
      console.log('Error fetchTeamOptions: ', error);
      this.teamOptions.set([]);
    }
  }

  private async fetchUserForEdit(userId: string) {
    try {
      const res = await firstValueFrom(this.api.getPrivate<any>(`/users/${userId}`));
      const data = res?.data ?? {};
      const roleIds: string[] = Array.isArray(data?.role_ids)
        ? data.role_ids.map((v: any) => String(v ?? '')).filter((v: string) => !!v)
        : [];

      this.form = {
        display_name: String(data?.display_name ?? ''),
        email: String(data?.email ?? ''),
        password: '',
        confirmPassword: '',
        role: String(data?.role ?? 'employee'),
        branch: data?.branch ? String(data.branch) : '',
        teams: roleIds
      };
    } catch (error) {
      console.log('Error fetchUserForEdit: ', error);
      this.form = {
        display_name: this.selectedUser()?.name || '',
        email: this.selectedUser()?.email || '',
        password: '',
        confirmPassword: '',
        role: this.selectedUser()?.level || 'employee',
        branch: this.selectedUser()?.branch || '',
        teams: []
      };
    }
  }
}
