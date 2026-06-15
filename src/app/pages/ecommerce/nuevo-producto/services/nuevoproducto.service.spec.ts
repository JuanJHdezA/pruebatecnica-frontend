import { TestBed } from '@angular/core/testing';
import { NuevoProductosService } from './nuevoproducto.service';

describe('ListaproductosService', () => {
  let service: NuevoProductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NuevoProductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
