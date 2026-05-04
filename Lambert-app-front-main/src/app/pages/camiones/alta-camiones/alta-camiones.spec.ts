import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AltaCamionComponent } from './alta-camiones';

describe('AltaCamionComponent', () => {
  let component: AltaCamionComponent;
  let fixture: ComponentFixture<AltaCamionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AltaCamionComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AltaCamionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
