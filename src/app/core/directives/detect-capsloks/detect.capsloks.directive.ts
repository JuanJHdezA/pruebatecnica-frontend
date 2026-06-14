import { Directive, EventEmitter, Output, HostListener } from '@angular/core';

@Directive({
  selector: 'p-password[detectCapsLock]'
})
export class DetectCapsLockDirective {
  @Output() capsLockChanged = new EventEmitter<boolean>();

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const isOn = event.getModifierState('CapsLock');
    this.capsLockChanged.emit(isOn);
  }
}
