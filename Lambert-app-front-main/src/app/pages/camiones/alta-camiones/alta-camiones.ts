import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CamionService } from '../../../services/camion.service';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-alta-camion',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, BreadcrumbComponent],
  templateUrl: './alta-camiones.html',
  styleUrls: ['./alta-camiones.scss'],
})
export class AltaCamionComponent {
  form: FormGroup;
  cargando = false;
  error: string | null = null;
  anoActual = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private camionService: CamionService,
    private router: Router
  ) {
    this.form = this.fb.group({
      marca_camion: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      modelo_camion: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      ano_camion: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.min(1900), Validators.max(this.anoActual)] }),
      tipo_camion: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      distancia_entre_ejes: this.fb.control(0, { nonNullable: true, validators: [Validators.required, Validators.min(2000), Validators.max(7000)] }),
      distancia_primer_eje_espalda_cabina: this.fb.control(0, { nonNullable: true, validators: [Validators.required] }),
      voladizo_delantero: this.fb.control(0, { nonNullable: true, validators: [Validators.required] }),
      voladizo_trasero: this.fb.control(0, { nonNullable: true, validators: [Validators.required] }),
      peso_eje_delantero: this.fb.control(0, { nonNullable: true, validators: [Validators.required] }),
      peso_eje_trasero: this.fb.control(0, { nonNullable: true, validators: [Validators.required] }),
      pbt: this.fb.control(0, { nonNullable: true, validators: [Validators.required] }),
      ancho_chasis_1: this.fb.control(0, { nonNullable: true, validators: [Validators.required] }),
      ancho_chasis_2: this.fb.control(0, { nonNullable: true }),
    });
  }

  guardar(): void {
    const c = this.form.getRawValue();
    const ano = Number(c.ano_camion);

    // Validaciones de negocio (replicando Paso 2)
    if (!c.marca_camion || !c.modelo_camion || !c.tipo_camion || !c.ano_camion) {
      this.error = 'Todos los campos principales deben estar completos.';
      return;
    }

    if (isNaN(ano) || ano < 1900 || ano > this.anoActual) {
      this.error = 'El año ingresado es inválido.';
      return;
    }

    if (!c.distancia_entre_ejes || !c.distancia_primer_eje_espalda_cabina ||
        !c.voladizo_delantero || !c.voladizo_trasero ||
        !c.peso_eje_delantero || !c.peso_eje_trasero || !c.pbt) {
      this.error = 'Todos los campos de configuración deben estar completos.';
      return;
    }

    if (c.pbt < (c.peso_eje_delantero + c.peso_eje_trasero)) {
      this.error = 'El PBT no puede ser menor a la suma de pesos de ejes.';
      return;
    }

    if (c.distancia_entre_ejes <= 2000 || c.distancia_entre_ejes > 7000) {
      this.error = 'La distancia entre ejes parece incorrecta (fuera de rango normal).';
      return;
    }

    this.cargando = true;
    this.error = null;

    const nuevoCamion = {
      marca_camion: c.marca_camion,
      modelo_camion: c.modelo_camion,
      ano_camion: c.ano_camion,
      tipo_camion: c.tipo_camion as '4x2' | '6x2',
      configuracion: {
        distancia_entre_ejes: c.distancia_entre_ejes,
        distancia_primer_eje_espalda_cabina: c.distancia_primer_eje_espalda_cabina,
        voladizo_delantero: c.voladizo_delantero,
        voladizo_trasero: c.voladizo_trasero,
        peso_eje_delantero: c.peso_eje_delantero,
        peso_eje_trasero: c.peso_eje_trasero,
        pbt: c.pbt,
        ancho_chasis_1: c.ancho_chasis_1,
        ancho_chasis_2: c.ancho_chasis_2,
        original: true,
        es_modificado: false,
      },
    };

    this.camionService.crearCamion(nuevoCamion).subscribe({
      next: (res) => {
        console.log('Camión creado', res);
        this.router.navigate(['/camiones']);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error creando camión', err);
        this.error = err.error?.error || 'Error creando camión.';
        this.cargando = false;
      },
    });
  }
}