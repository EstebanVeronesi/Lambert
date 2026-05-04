import { Injectable } from '@angular/core';
import { DatosFormularioProyecto } from '../types/proyecto.types';

@Injectable({
  providedIn: 'root'
})
export class FormDataService {
  private datosProyecto: DatosFormularioProyecto | null = null;
  private datosReSimulacion: any = null;

  setDatosProyecto(datos: DatosFormularioProyecto) {
    this.datosProyecto = datos;
  }

  getDatosProyecto(): DatosFormularioProyecto | null {
    return this.datosProyecto;
  }

  clearDatosProyecto() {
    this.datosProyecto = null;
  }

  setDatosReSimulacion(datos: any) {
    this.datosReSimulacion = datos;
  }

  getDatosReSimulacion(): any {
    return this.datosReSimulacion;
  }
}
