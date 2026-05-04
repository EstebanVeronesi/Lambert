import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Paso1CamionComponent } from './pasos/paso1-camion/paso1-camion';
import { Paso2ConfiguracionComponent } from './pasos/paso2-configuracion/paso2-configuracion';
import { Paso3ResultadosComponent } from './pasos/paso3-resultados/paso3-resultados';
import { Paso4ClienteComponent } from './pasos/paso4-cliente/paso4-cliente';
import { CargaExtra, Configuracion, Carroceria, DatosFormularioProyecto } from '../../types/proyecto.types';
import { FormDataService } from '../../services/form-data.service';
import { ProyectoService } from '../../services/proyecto.service';
import { LoginService } from '../../services/auth/login.service';
import { CamionService } from '../../services/camion.service';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, Paso1CamionComponent, Paso2ConfiguracionComponent, Paso3ResultadosComponent, Paso4ClienteComponent, BreadcrumbComponent],
  templateUrl: './formulario.html',
  styleUrls: ['./formulario.scss']
})
export class FormularioComponent implements OnInit {
  paso = 1;
  modoLectura: boolean = false;
  esModificado: boolean = false;
  errorConfiguracion: string = '';
  datosProyecto: DatosFormularioProyecto | null = null;
  datosCamion: DatosFormularioProyecto['camion'] = {
    id: null,
    marca_camion: '',
    modelo_camion: '',
    ano_camion: '',
    tipo_camion: '4x2'
  };
  datosConfiguracion: {
    configuracion: Configuracion;
    carroceria: Carroceria;
    cargas_extra: CargaExtra[];
  } = {
    configuracion: {
      distancia_entre_ejes: 0,
      distancia_primer_eje_espalda_cabina: 0,
      voladizo_delantero: 0,
      voladizo_trasero: 0,
      peso_eje_delantero: 0,
      peso_eje_trasero: 0,
      ancho_chasis_1: 0,
      ancho_chasis_2: null,
      pbt: 0,
    },
    carroceria: {
      tipo_carroceria: 'Metálica',
      largo_carroceria: 0,
      alto_carroceria: 0,
      ancho_carroceria: 0,
      separacion_cabina_carroceria: 0,
      equipo_frio_marca_modelo: ''
    },
    cargas_extra: []
  };
  resultadosSimulacion: any = null;


  constructor(
    private formDataService: FormDataService,
    private proyectoService: ProyectoService,
    private loginService: LoginService,
    private camionService: CamionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['resimular'] === 'true') {
        const datos = this.formDataService.getDatosReSimulacion();
        if (datos) {
          this.datosCamion = datos.camion;
          this.datosConfiguracion = {
            configuracion: datos.configuracion,
            carroceria: datos.carroceria,
            cargas_extra: datos.cargas_extra
          };
          this.modoLectura = false;
          this.paso = 3;
          return;
        }
      }

      const guardados = this.formDataService.getDatosProyecto();
      if (guardados) {
        this.datosCamion = guardados.camion;
        this.datosConfiguracion = {
          configuracion: guardados.configuracion,
          carroceria: guardados.carroceria,
          cargas_extra: guardados.cargas_extra ?? []
        };
      }
    });
  }

  irAlPaso(num: number) {
    this.paso = num;
  }

  recibirCamion(data: { camion: DatosFormularioProyecto['camion'], es_modificado: boolean }) {
  const anterior = this.datosCamion;
  const nuevo = data.camion;   // usar solo el objeto plano
  const ambosManuales = !anterior?.id && !nuevo?.id;
  const mismoCamionManual =
    ambosManuales &&
    anterior?.marca_camion === nuevo?.marca_camion &&
    anterior?.modelo_camion === nuevo?.modelo_camion &&
    anterior?.ano_camion === nuevo?.ano_camion &&
    anterior?.tipo_camion === nuevo?.tipo_camion;
  const mismoCamionBD = anterior?.id && nuevo?.id && anterior.id === nuevo.id;
  const debeLimpiar = !(mismoCamionManual || mismoCamionBD);

  if (debeLimpiar) {
    console.log('Camión cambiado → limpiando configuración previa...');
    this.datosConfiguracion = {
      configuracion: {
        distancia_entre_ejes: 0,
        distancia_primer_eje_espalda_cabina: 0,
        voladizo_delantero: 0,
        voladizo_trasero: 0,
        peso_eje_delantero: 0,
        peso_eje_trasero: 0,
        ancho_chasis_1: 0,
        ancho_chasis_2: null,
        pbt: 0,
      },
      carroceria: {
        tipo_carroceria: 'Metálica',
        largo_carroceria: 0,
        alto_carroceria: 0,
        ancho_carroceria: 0,
        separacion_cabina_carroceria: 0,
        equipo_frio_marca_modelo: ''
      },
      cargas_extra: []
    };
  } else {
    console.log('Mismo camión detectado → se conserva configuración.');
  }

  this.datosCamion = { ...data.camion };
  this.esModificado = data.es_modificado;

  // Si es original de BD: modoLectura = true y traer configuración
  this.modoLectura = !data.es_modificado && !!data.camion.id;
  if (data.camion.id) {
    this.camionService.getConfiguracion(data.camion.id!).subscribe({
      next: (config: Configuracion) => {
        //convertir str a número
        const parsedConfig: Configuracion = {
          distancia_entre_ejes: Number(config.distancia_entre_ejes),
          distancia_primer_eje_espalda_cabina: Number(config.distancia_primer_eje_espalda_cabina),
          voladizo_delantero: Number(config.voladizo_delantero),
          voladizo_trasero: Number(config.voladizo_trasero),
          peso_eje_delantero: Number(config.peso_eje_delantero),
          peso_eje_trasero: Number(config.peso_eje_trasero),
          pbt: Number(config.pbt),
          ancho_chasis_1: Number(config.ancho_chasis_1),
          ancho_chasis_2: config.ancho_chasis_2 ? Number(config.ancho_chasis_2) : null };

        this.datosConfiguracion = {
          ...this.datosConfiguracion,
          configuracion: parsedConfig
        };
        console.log('Configuración original cargada:', config);
      },
      error: (err: any) => {
        console.error('Error cargando configuración del camión:', err);
        this.errorConfiguracion = 'Error al cargar la configuración del camión.';
      }
    });
  }

  console.log('DEBUG esModificado después', this.esModificado);
  console.log('Camión seleccionado:', this.datosCamion);
  }

  recibirConfiguracion(data: any) {
    this.datosConfiguracion = data;
    console.log('Configuración recibida:', data);
  }

  armarDatosProyecto(): DatosFormularioProyecto {
    const usuarioLogueado = this.loginService.getCurrentUser();
    const proyecto: DatosFormularioProyecto = {
      cliente: { cuit: 1, razon_social: 'Pendiente' },
      vendedor: { id: Number(usuarioLogueado!.id || 1), nombre: usuarioLogueado!.nombre || 'Usuario' },
      camion: { ...this.datosCamion },
      configuracion: this.datosConfiguracion.configuracion!,
      carroceria: this.datosConfiguracion.carroceria!,
      cargas_extra: this.datosConfiguracion.cargas_extra ?? [],
    };

    // GUARDAR PARA PERSISTENCIA
    this.formDataService.setDatosProyecto(proyecto);
    return proyecto;
  }

  simularProyecto() {
  const datos = this.armarDatosProyecto();
  this.proyectoService.simularProyecto(datos).subscribe({
    next: (resp) => {
      console.log('Resultados simulación:', resp);
            this.irAlPaso(3);
    },
    error: (err) => {
      console.error('Error al simular proyecto:', err);
    }
  });
}

  guardarProyecto(resultados: any) {
  const datos = this.armarDatosProyecto();
  this.resultadosSimulacion = resultados;

  this.datosProyecto = datos;
  this.irAlPaso(4);
  }

  volverAModificar() {
    console.log('Volviendo al paso 2 con los datos actuales...');
    this.paso = 2;
  }

}