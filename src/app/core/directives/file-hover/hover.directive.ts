import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHover]'
})
export class HoverDirective {
  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.style.borderRadius = '20px';
  }

  @Input('appHover') parametro: string = '';

  @HostListener('mouseenter') mouseEntro() {
    this.resaltar(this.parametro || 'yellow');
  }

  @HostListener('mouseleave') mouseSalio() {
    this.resaltar('');
  }

  private resaltar(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
