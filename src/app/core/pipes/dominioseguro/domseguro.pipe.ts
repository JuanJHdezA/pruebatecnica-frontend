import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'dominioSeguro',
  standalone: true
})
export class DomseguroPipe implements PipeTransform {
  constructor(private _domSanitizer: DomSanitizer) {}

  transform(value: string, ...args: unknown[]): SafeResourceUrl {
    //Permite crear seguridad y pases para URL de confianzas
    return this._domSanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
