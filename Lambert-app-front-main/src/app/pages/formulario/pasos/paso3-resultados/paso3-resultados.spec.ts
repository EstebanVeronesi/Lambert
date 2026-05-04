import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Paso3ResultadosComponent } from './paso3-resultados';

describe('Paso3ResultadosComponent', () => {
  let component: Paso3ResultadosComponent;
  let fixture: ComponentFixture<Paso3ResultadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paso3ResultadosComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Paso3ResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
