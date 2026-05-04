import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { CamionDetalleComponent } from './detalle-camiones';

describe('CamionDetalleComponent', () => {
  let component: CamionDetalleComponent;
  let fixture: ComponentFixture<CamionDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CamionDetalleComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CamionDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
