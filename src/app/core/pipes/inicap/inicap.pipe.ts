import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'inicap',
  standalone: true // Asegúrate de marcarlo como standalone si usas Angular moderno
})
export class InicapPipe implements PipeTransform {
  private readonly conectores: Set<string> = new Set([
    'del',
    'de',
    'la',
    'las',
    'los',
    'al',
    'el',
    'él',
    'y',
    'con',
    'o',
    'u',
    'para',
    'por',
    'e',
    'a',
    'i'
  ]);

  transform(value: string, capitalizarTodo: boolean = false): string {
    if (!value?.trim()) return '';

    const palabras = value.toLowerCase().split(/\s+/);

    const resultado = palabras.map((palabra, index) => {
      const esConector = this.conectores.has(palabra);
      const esPrimera = index === 0;

      // Lógica corregida:
      // Si es la primera palabra O (no es conector), capitalizamos.
      // Si capitalizarTodo es true, forzamos la capitalización siempre.
      if (esPrimera || capitalizarTodo || !esConector) {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
      }

      return palabra;
    });

    return resultado.join(' ');
  }
}
