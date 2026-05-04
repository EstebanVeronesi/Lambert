import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CamionService, CamionListado } from '../../../../services/camion.service';
import { UniquePipe } from '../../../../shared/pipes/unique-pipe';
import { DatosFormularioProyecto } from '../../../../types/proyecto.types';

@Component({
  selector: 'app-paso1-camion',
  standalone: true,
  imports: [CommonModule, FormsModule, UniquePipe],
  templateUrl: './paso1-camion.html',
  styleUrls: ['./paso1-camion.scss'],
})

export class Paso1CamionComponent {
  @Output() siguiente = new EventEmitter<void>();
  @Output() camionSeleccionado = new EventEmitter<{ camion: DatosFormularioProyecto['camion'], es_modificado: boolean }>();

  modo: 'busqueda' | 'manual' = 'busqueda';

  marcaSeleccionada = '';
  modeloSeleccionado = '';
  tipoSeleccionado = '';
  anoSeleccionado = '';

  camiones: CamionListado[] = [];
  modelosDisponibles: string[] = [];
  tiposDisponibles: string[] = [];
  anosDisponibles: string[] = [];

  camionEncontrado: CamionListado | null = null;
  opcion: 'original' | 'modificado' | '' = '';

  cargando = true;
  error = '';
  busquedaHecha = false;

  camionManual = {
    marca_camion: '',
    modelo_camion: '',
    ano_camion: '',
    tipo_camion: ''
  };

  errorValidacion = '';
  intentoContinuarManual = false;

  anoActual = new Date().getFullYear(); 

  get anoValido(): boolean {
  const ano = Number(this.camionManual.ano_camion);
  return !isNaN(ano) && ano >= 1900 && ano <= this.anoActual;
}

  constructor(private camionService: CamionService) {}

  ngOnInit() {
    this.camionService.getCamiones().subscribe({
      next: (data) => {
        this.camiones = data || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error trayendo camiones:', err);
        this.error = 'No se pudieron cargar los camiones';
        this.cargando = false;
      }
    });
  }

  activarBusqueda() {
    this.modo = 'busqueda';
    this.limpiarManual();
  }

  activarCargaManual() {
    this.modo = 'manual';
    this.limpiarBusqueda();
  }

  limpiarBusqueda() {
    this.marcaSeleccionada = '';
    this.modeloSeleccionado = '';
    this.tipoSeleccionado = '';
    this.anoSeleccionado = '';

    this.modelosDisponibles = [];
    this.tiposDisponibles = [];
    this.anosDisponibles = [];

    this.camionEncontrado = null;
    this.busquedaHecha = false;
    this.opcion = '';
  }

  limpiarManual() {
    this.camionManual = {
      marca_camion: '',
      modelo_camion: '',
      ano_camion: '',
      tipo_camion: ''
    };
  }

  filtrarModelos() {
    if (!this.marcaSeleccionada) {
      this.modelosDisponibles = [];
      this.modeloSeleccionado = '';
      return;
    }
    this.modelosDisponibles = [
      ...new Set(
        this.camiones
          .filter(c => c.marca_camion === this.marcaSeleccionada)
          .map(c => c.modelo_camion)
      )
    ];
    this.modeloSeleccionado = '';
    this.anoSeleccionado = '';
    this.anosDisponibles = [];
    
  }

  filtrarTipos() {
    if (!this.modeloSeleccionado) {
      this.tiposDisponibles = [];
      return;
    }

    this.tiposDisponibles = [
      ...new Set(
        this.camiones
          .filter(c =>
            c.marca_camion === this.marcaSeleccionada &&
            c.modelo_camion === this.modeloSeleccionado
          )
          .map(c => c.tipo_camion)
      )
    ];

    this.anosDisponibles = [];
    this.anoSeleccionado = '';
    if (this.tipoSeleccionado) { this.filtrarAnos(); }
  }

  filtrarAnos() {
    if (!this.tipoSeleccionado) {
      this.anosDisponibles = [];
      return;
    }
    this.anosDisponibles = [
      ...new Set(
        this.camiones
          .filter(c =>
            (!this.marcaSeleccionada || c.marca_camion === this.marcaSeleccionada) &&
            (!this.modeloSeleccionado || c.modelo_camion === this.modeloSeleccionado) &&
            c.tipo_camion === this.tipoSeleccionado
          )
          .map(c => c.ano_camion)
      )
    ];
    this.anoSeleccionado = '';
  }

  buscarCamion() {
    this.busquedaHecha = true;
    this.camionEncontrado = this.camiones.find(c =>
      c.marca_camion === this.marcaSeleccionada &&
      c.modelo_camion === this.modeloSeleccionado &&
      c.tipo_camion === this.tipoSeleccionado &&
      c.ano_camion === this.anoSeleccionado
    ) || null;
  }

 continuar() {
    if (this.camionEncontrado) {
      const esModificado = this.opcion === 'modificado';
      this.camionSeleccionado.emit({ camion: this.camionEncontrado, es_modificado: esModificado });
      this.siguiente.emit();
    }
  }

  validarManual(): boolean {
    this.errorValidacion = '';
    const ano = Number(this.camionManual.ano_camion);

    if (!this.camionManual.marca_camion || !this.camionManual.modelo_camion || !this.camionManual.tipo_camion || !this.camionManual.ano_camion) {
      this.errorValidacion = 'Todos los campos deben estar completos.';
      return false;
    }

    if (isNaN(ano) || ano < 1900 || ano > this.anoActual) {
      this.errorValidacion = 'El año ingresado es inválido.';
      return false;
    }

    return true;
  }

  continuarManual() {
  console.log('DEBUG continuar desde modo manual -> opcion:', this.opcion);

    this.intentoContinuarManual = true;

    if (!this.validarManual()) {
      return;
    }

    const camion: DatosFormularioProyecto['camion'] = {
      id: null,
      marca_camion: this.camionManual.marca_camion,
      modelo_camion: this.camionManual.modelo_camion,
      ano_camion: this.camionManual.ano_camion,
      tipo_camion: this.camionManual.tipo_camion as '4x2' | '6x2'
    };

    const esModificado = this.opcion === 'modificado';
    this.camionSeleccionado.emit({ camion, es_modificado: esModificado });
    this.siguiente.emit();
  }
}