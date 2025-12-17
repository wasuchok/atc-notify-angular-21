import { CommonModule } from '@angular/common';
import { Component, forwardRef, HostBinding, Input, computed, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

let nextId = 0;

@Component({
  selector: 'app-select-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectInputComponent),
      multi: true
    }
  ],
  template: `
    <label *ngIf="label" class="block text-sm font-semibold text-slate-800" [attr.for]="id">
      {{ label }}
      <span *ngIf="required" class="text-rose-600">*</span>
    </label>

    <div [class.mt-1.5]="!!label">
      <select
        [id]="id"
        [value]="value()"
        [disabled]="isDisabled()"
        (change)="onSelect($event)"
        (blur)="onBlur()"
        class="w-full rounded-xl border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition"
        [class.border-slate-200]="!showInvalid()"
        [class.focus:border-primary-500]="!showInvalid()"
        [class.focus:ring-4]="true"
        [class.focus:ring-primary-500/10]="!showInvalid()"
        [class.border-rose-300]="showInvalid()"
        [class.focus:border-rose-500]="showInvalid()"
        [class.focus:ring-rose-500/15]="showInvalid()"
        [class.opacity-60]="isDisabled()"
        [class.cursor-not-allowed]="isDisabled()"
        [ngClass]="selectClass">
        <option *ngIf="placeholder" [value]="placeholderValue" [disabled]="placeholderDisabled">
          {{ placeholder }}
        </option>

        @for (opt of options; track opt.value) {
          <option [value]="opt.value" [disabled]="opt.disabled">{{ opt.label }}</option>
        } @empty {
          <option [value]="emptyValue" disabled>{{ emptyLabel }}</option>
        }
      </select>
    </div>

    <p *ngIf="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
    <p *ngIf="errorToShow()" class="mt-1 text-xs font-medium text-rose-700">{{ errorToShow() }}</p>
  `
})
export class SelectInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() required = false;
  @Input() hint = '';
  @Input() error = '';

  @Input() options: ReadonlyArray<SelectOption> = [];

  @Input() placeholder = '';
  @Input() placeholderValue = '';
  @Input() placeholderDisabled = true;

  @Input() emptyLabel = 'ไม่มีข้อมูลให้เลือก';
  @Input() emptyValue = '';

  @Input() selectClass: string | string[] | Record<string, boolean> = '';
  @Input() id = `select-input-${++nextId}`;

  @HostBinding('class.block') hostBlock = true;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  value = signal('');
  isDisabled = signal(false);
  private wasTouched = signal(false);

  showInvalid = computed(() => {
    if (this.isDisabled()) return false;
    if (this.error) return true;
    if (!this.wasTouched()) return false;
    if (!this.required) return false;

    const val = (this.value() ?? '').toString();
    return !val.trim() || val === this.placeholderValue;
  });

  errorToShow = computed(() => {
    if (this.error) return this.error;
    if (!this.showInvalid()) return '';
    return 'กรุณาเลือกข้อมูล';
  });

  writeValue(value: unknown): void {
    this.value.set((value ?? '') as string);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onSelect(event: Event) {
    const next = ((event.target as HTMLSelectElement).value ?? '') as string;
    this.value.set(next);
    this.onChange(next);
  }

  onBlur() {
    this.wasTouched.set(true);
    this.onTouched();
  }
}

