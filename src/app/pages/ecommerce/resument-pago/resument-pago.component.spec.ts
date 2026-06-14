import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumentPagoComponent } from './resument-pago.component';

describe('ResumentPagoComponent', () => {
  let component: ResumentPagoComponent;
  let fixture: ComponentFixture<ResumentPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumentPagoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ResumentPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
