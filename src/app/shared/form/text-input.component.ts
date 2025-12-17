import { CommonModule } from '@angular/common';
import { Component, forwardRef, HostBinding, Input, computed, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true
    }
  ],
  template: `
    <label *ngIf="label" class="block text-sm font-semibold text-slate-800" [attr.for]="id">
      {{ label }}
      <span *ngIf="required" class="text-rose-600">*</span>
    </label>

    <div class="mt-1.5">
      <input
        [id]="id"
        [type]="type"
        [value]="value()"
        [attr.placeholder]="placeholder || null"
        [attr.autocomplete]="autocomplete || null"
        [attr.inputmode]="inputMode || null"
        [attr.maxlength]="maxLength ?? null"
        [attr.minlength]="minLength ?? null"
        [attr.readonly]="readonly ? true : null"
        [disabled]="isDisabled()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        class="w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition"
        [class.border-slate-200]="!showInvalid()"
        [class.focus:border-primary-500]="!showInvalid()"
        [class.focus:ring-4]="true"
        [class.focus:ring-primary-500/10]="!showInvalid()"
        [class.border-rose-300]="showInvalid()"
        [class.focus:border-rose-500]="showInvalid()"
        [class.focus:ring-rose-500/15]="showInvalid()"
        [class.opacity-60]="isDisabled()"
        [class.cursor-not-allowed]="isDisabled()"
        [ngClass]="inputClass" />
    </div>

    <p *ngIf="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
    <p *ngIf="errorToShow()" class="mt-1 text-xs font-medium text-rose-700">{{ errorToShow() }}</p>
  `
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' = 'text';
  @Input() autocomplete?: string;
  @Input() inputMode?: 'text' | 'email' | 'numeric' | 'tel' | 'url' | 'search';
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() readonly = false;
  @Input() required = false;
  @Input() hint = '';
  @Input() error = '';
  @Input() inputClass: string | string[] | Record<string, boolean> = '';
  @Input() id = `text-input-${++nextId}`;

  @HostBinding('class') hostClass = 'block';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  value = signal('');
  isDisabled = signal(false);

  private wasTouched = signal(false);

  private isEmailValid(value: string) {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  showInvalid = computed(() => {
    if (this.isDisabled()) return false;
    if (this.error) return true;
    if (!this.wasTouched()) return false;

    const val = (this.value() ?? '').toString();
    if (this.required && !val.trim()) return true;
    if (this.minLength != null && val.length < this.minLength) return true;
    if (this.maxLength != null && val.length > this.maxLength) return true;
    if (this.type === 'email' && !this.isEmailValid(val)) return true;
    return false;
  });

  errorToShow = computed(() => {
    if (this.error) return this.error;
    if (!this.wasTouched()) return '';

    const val = (this.value() ?? '').toString();
    if (this.required && !val.trim()) return 'กรุณากรอกข้อมูล';
    if (this.minLength != null && val.length < this.minLength) return `อย่างน้อย ${this.minLength} ตัวอักษร`;
    if (this.maxLength != null && val.length > this.maxLength) return `ไม่เกิน ${this.maxLength} ตัวอักษร`;
    if (this.type === 'email' && !this.isEmailValid(val)) return 'รูปแบบอีเมลไม่ถูกต้อง';

    return '';
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

  onInput(event: Event) {
    const next = (event.target as HTMLInputElement).value ?? '';
    this.value.set(next);
    this.onChange(next);
  }

  onBlur() {
    this.wasTouched.set(true);
    this.onTouched();
  }
}
