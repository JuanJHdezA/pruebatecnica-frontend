import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  OnDestroy,
  AfterViewInit,
  HostListener,
  Optional,
  Self,
  ChangeDetectorRef,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { PrimeNGModule } from '../../core/modules/primeng.module';

@Component({
  selector: 'app-custom-password',
  standalone: true,
  imports: [CommonModule, PrimeNGModule],
  templateUrl: './custom-password.component.html',
  styleUrls: ['./custom-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomPasswordComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() placeholder: string = '••••••••';
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  value: string = '';
  type: 'password' | 'text' = 'password';
  isDisabled: boolean = false;
  isCapsLockOn: boolean = false;
  iconLock: string = 'pi pi-lock';

  private observer!: MutationObserver;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private cdr: ChangeDetectorRef,
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // --- GETTER DE ESTADO DE VALIDACIÓN ---
  get isInvalid(): boolean {
    const control = this.ngControl?.control;
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  ngAfterViewInit() {
    this.setupSecurityObserver();
  }

  private setupSecurityObserver() {
    if (!this.passwordInput) return;
    const el = this.passwordInput.nativeElement;

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'type') {
          const currentType = el.getAttribute('type');
          if (this.type === 'password' && currentType !== 'password') {
            el.type = 'password';
            console.warn('Intento de violación de privacidad bloqueado.');
            this.cdr.detectChanges();
          }
        }
      });
    });

    this.observer.observe(el, { attributes: true });
  }

  // --- DETECCIÓN DE MAYÚSCULAS ---
  @HostListener('window:keydown', ['$event'])
  @HostListener('window:keyup', ['$event'])
  checkCapsLock(event: KeyboardEvent) {
    const prevState = this.isCapsLockOn;
    this.isCapsLockOn = event.getModifierState('CapsLock');
    if (prevState !== this.isCapsLockOn) {
      this.cdr.detectChanges();
    }
  }

  onChange: any = (_: any) => {};
  onTouched: any = () => {};

  writeValue(val: any): void {
    this.value = val || '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  toggleValue() {
    this.type = this.type === 'password' ? 'text' : 'password';
    this.iconLock = this.type === 'password' ? 'pi pi-lock' : 'pi pi-lock-open';
  }

  handleInput(event: any) {
    this.value = event.target.value;
    this.onChange(this.value);
  }

  onBlur() {
    this.onTouched();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
