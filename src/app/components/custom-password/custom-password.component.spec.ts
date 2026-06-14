import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPasswordComponent } from './custom-password.component';

describe('CustomPasswordComponent', () => {
  let component: CustomPasswordComponent;
  let fixture: ComponentFixture<CustomPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomPasswordComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
