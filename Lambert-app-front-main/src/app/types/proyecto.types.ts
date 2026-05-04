//Carga adicional
export interface CargaExtra {
  descripcion: string;
  peso: number;                    // kg
  distancia_eje_delantero: number; // mm
}

//Configuración del camion
export interface Configuracion {
  distancia_entre_ejes: number;                 // mm
  distancia_primer_eje_espalda_cabina: number;  // mm
  voladizo_delantero: number;                   // mm
  voladizo_trasero: number;                     // mm
  peso_eje_delantero: number;                   // kg
  peso_eje_trasero: number;                     // kg
  ancho_chasis_1: number;                       // mm
  ancho_chasis_2?: number | null;               // mm
  pbt: number;                                  // kg
  original?: boolean;                           // opcional
  es_modificado?: boolean;                      // flag para backend
}

//Configuración de la carroceria
export interface Carroceria {
  tipo_carroceria: 'Metálica' | 'Térmica';
  largo_carroceria: number;                 // mm
  alto_carroceria: number;                  // mm
  ancho_carroceria: number;                 // mm
  separacion_cabina_carroceria: number;     // mm
  equipo_frio_marca_modelo?: string;        // opcional
}

// Datos básicos que el front envía al backend
export interface DatosFormularioProyecto {
  cliente: {
    cuit: number;
    razon_social: string;
  };
  vendedor: {
    id: number;
    nombre: string;
  };
  camion: {
    id?: number | null;
    marca_camion: string;
    modelo_camion: string;
    ano_camion: string;
    tipo_camion: '4x2' | '6x2';
  };
  configuracion: Configuracion;
  carroceria: Carroceria;
  cargas_extra?: CargaExtra[];
}

// Datos para el diagrama visual de distribución de cargas
export interface DiagramaCargaExtra {
  descripcion: string;
  peso: number;          // kg
  posicion: number;      // mm desde eje delantero
}

export interface DiagramaCargaData {
  posicionEjeDelantero: number;       // siempre 0
  posicionEjeTrasero: number;         // distancia_entre_ejes
  posicionCabinaInicio: number;        // negativo (voladizo delantero)
  posicionCabinaFin: number;           // 0
  posicionCarroceriaInicio: number;
  posicionCarroceriaFin: number;
  posicionCentroCargaCarroceria: number;
  posicionCentroCargaTotal: number;
  voladizoDelantero: number;
  voladizoTrasero: number;
  largoTotal: number;
  cargaMaxEjeDelantero: number;
  cargaMaxEjeTrasero: number;
  pesoEjeDelantero: number;
  pesoEjeTrasero: number;
  cargaUtilDelantero: number;
  cargaUtilTrasero: number;
  porcentajeUsoEjeDelantero: number;
  porcentajeUsoEjeTrasero: number;
  cargasExtra: DiagramaCargaExtra[];
  tipoCamion: '4x2' | '6x2';
}

export interface Recomendacion {
  texto: string;
  prioridad: 1 | 2 | 3;
  tipo: 'reducir_largo_carroceria' | 'ajustar_separacion' | 'mover_cargas_extra' | 'desplazar_eje' | 'modificar_chasis' | 'cambiar_a_6x2' | 'mayor_pbt' | 'revisar_configuracion';
}

export interface ResultadosCalculo {
  // Resultados principales
  resultado_peso_bruto_total_maximo: number;       // kg
  resultado_carga_eje_delantero_calculada: number; // kg
  resultado_carga_eje_trasero_calculada: number;   // kg
  resultado_porcentaje_carga_eje_delantero: number; // %
  resultado_modificacion_chasis: string;
  resultado_voladizo_trasero_calculado: number;     // mm
  resultado_largo_final_camion: number;            // mm
  resultado_centro_carga_total: number;             // mm
  resultado_centro_carga_carroceria: number;        // mm
  resultado_nueva_distancia_entre_ejes: number;     // mm
  resultado_desplazamiento_eje: number;             // mm

  // Verificaciones y recomendaciones
  verificacion_distribucion_carga_ok: boolean;
  verificacion_voladizo_trasero_ok: boolean;
  verificacion_largo_total_equipo_ok?: boolean;
  recomendaciones: Recomendacion[];
  observaciones?: string[];

  // Diagrama visual de distribución de cargas
  diagramaCarga?: DiagramaCargaData;
}

// Objeto que el front envía al backend para guardar
export interface ProyectoCompletoParaGuardar {
  es_modificado: boolean;                      // opcional
  datosEntrada: DatosFormularioProyecto;
  resultados: ResultadosCalculo;
}

// Objeto que el backend devuelve al guardar
export interface ProyectoResponse {
  id: number;
  datosEntrada: DatosFormularioProyecto;
  resultados: ResultadosCalculo;
}

// Respuesta de la API al simular un proyecto
export type SimulacionResponse = ResultadosCalculo;
