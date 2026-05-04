import { Component, EventEmitter, Output, Input, OnInit, OnChanges, AfterViewInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatosFormularioProyecto, CargaExtra, Configuracion, Carroceria } from '../../../../types/proyecto.types';

declare var bootstrap: any;

type CargasExtra = CargaExtra[];

@Component({
  selector: 'app-paso2-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paso2-configuracion.html',
  styleUrls: ['./paso2-configuracion.scss']
})
export class Paso2ConfiguracionComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() datosGuardados?: {
    configuracion: DatosFormularioProyecto['configuracion'];
    carroceria: DatosFormularioProyecto['carroceria'];
    cargas_extra?: CargasExtra;
  };
  @Input() modoLectura: boolean = false;
  
  @Output() siguiente = new EventEmitter<void>();
  @Output() anterior = new EventEmitter<void>();
  @Output() configuracionGuardada = new EventEmitter<{
    configuracion: Configuracion;
    carroceria: Carroceria;
    cargas_extra: CargasExtra;
  }>();

  configuracion: DatosFormularioProyecto['configuracion'] = {
    distancia_entre_ejes: 0,
    distancia_primer_eje_espalda_cabina: 0,
    voladizo_delantero: 0,
    voladizo_trasero: 0,
    peso_eje_delantero: 0,
    peso_eje_trasero: 0,
    ancho_chasis_1: 0,
    ancho_chasis_2: null,
    pbt: 0,
  };

  carroceria: DatosFormularioProyecto['carroceria'] = {
    tipo_carroceria: 'Metálica',
    largo_carroceria: 0,
    alto_carroceria: 0,
    ancho_carroceria: 0,
    separacion_cabina_carroceria: 0,
    equipo_frio_marca_modelo: ''
  };

  cargas_extra: CargasExtra = [];
  nuevaCarga: { descripcion: string; peso: number, distancia_eje_delantero: number } = {
    descripcion: '',
    peso: 0,
    distancia_eje_delantero: 0
  };

  errorValidacion = '';

  ngOnInit() {
    if (this.datosGuardados) {
      this.configuracion = { ...this.datosGuardados.configuracion };
      this.carroceria = { ...this.datosGuardados.carroceria };
      this.cargas_extra = [...(this.datosGuardados.cargas_extra ?? [])];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
  if (changes['datosGuardados'] && this.datosGuardados) {
    this.configuracion = { ...this.datosGuardados.configuracion };
    this.carroceria = { ...this.datosGuardados.carroceria };
    this.cargas_extra = [...(this.datosGuardados.cargas_extra ?? [])];
  }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltips.forEach(el => new bootstrap.Tooltip(el));
    }, 300);
  }

  agregarCarga() {
    if (this.nuevaCarga.descripcion && this.nuevaCarga.peso > 0 && this.nuevaCarga.distancia_eje_delantero > 0) {
      this.cargas_extra.push({ ...this.nuevaCarga });
      this.nuevaCarga = { descripcion: '', peso: 0, distancia_eje_delantero: 0 };
    }
  }

  eliminarCarga(index: number) {
    this.cargas_extra.splice(index, 1);
  }

  validarDatos(): boolean {
    this.errorValidacion = '';

    const c = this.configuracion;
    const carro = this.carroceria;

    if (
      !c.distancia_entre_ejes || !c.distancia_primer_eje_espalda_cabina ||
      !c.voladizo_delantero || !c.voladizo_trasero ||
      !c.peso_eje_delantero || !c.peso_eje_trasero || !c.pbt
    ) {
      this.errorValidacion = 'Todos los campos de configuración deben estar completos.';
      return false;
    }

    if (!carro.tipo_carroceria) {
      this.errorValidacion = 'Debe seleccionar el tipo de carrocería.';
      return false;
    }

    if (c.pbt < (c.peso_eje_delantero + c.peso_eje_trasero)) {
      this.errorValidacion = 'El PBT no puede ser menor a la suma de pesos de ejes.';
      return false;
    }

    if (c.distancia_entre_ejes <= 2000 || c.distancia_entre_ejes > 7000) {
      this.errorValidacion = 'La distancia entre ejes parece incorrecta (fuera de rango normal).';
      return false;
    }

    return true;
  }

  continuar() {
    if (this.modoLectura) {
      this.configuracionGuardada.emit({
        configuracion: { ...this.configuracion },
        carroceria: { ...this.carroceria },
        cargas_extra: [ ...this.cargas_extra]
      });
        this.siguiente.emit();
        return;
      }

    if (!this.validarDatos()) {
    console.warn('Validación fallida:', this.errorValidacion);
    return;
  }

  const payload = {
    configuracion: { ...this.configuracion },
    carroceria: { ...this.carroceria },
    cargas_extra: [...this.cargas_extra]
  };

  console.log('Datos de configuración listos para enviar:', payload);

  this.configuracionGuardada.emit(payload);
  this.siguiente.emit();
}
  
  volver() {
    this.anterior.emit();
  }
}
