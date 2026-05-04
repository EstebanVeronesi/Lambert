// src/app/core/models/project.types.ts

// Carga adicional
export interface CargaExtra {
  descripcion: string;
  peso: number;                    // kg
  distancia_eje_delantero: number; // mm
}

// Carga extra posicionada para el diagrama de carga
export interface DiagramaCargaExtra {
  descripcion: string;
  peso: number;
  posicion: number; // mm desde eje delantero
}

// Datos completos para renderizar el diagrama SVG proporcional del camión
export interface DiagramaCargaData {
  posicionEjeDelantero: number;
  posicionEjeTrasero: number;
  posicionCabinaInicio: number;
  posicionCabinaFin: number;
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

// Datos que el usuario enviará a la API
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
    tipo_camion: '4x2' | '6x2'
  };
  configuracion: {
    distancia_entre_ejes: number;             // mm
    distancia_primer_eje_espalda_cabina: number; // mm
    voladizo_delantero: number;               // mm
    voladizo_trasero: number;                 // mm
    peso_eje_delantero: number;               // kg
    peso_eje_trasero: number;                 // kg
    ancho_chasis_1: number;                   // mm
    ancho_chasis_2?: number | null;           // mm
    pbt: number;                              // kg
    original?: boolean;                       // flag en BD
    es_modificado?: boolean;                  // flag en BD
  };
  carroceria: {
    tipo_carroceria: 'Metálica' | 'Térmica';
    largo_carroceria: number;                 // mm
    alto_carroceria: number;                  // mm
    ancho_carroceria: number;                 // mm
    separacion_cabina_carroceria: number;     // mm
    equipo_frio_marca_modelo?: string;        // si aplica
  };
  cargas_extra?: CargaExtra[];                // accesorios opcionales
}

// Resultados completos
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
  
  // Agrego opcionalmente los campos de error para compatibilidad con el frontend existente
  camposConError?: string[];

  // Diagrama de carga para renderizado SVG proporcional del camión
  diagramaCarga?: DiagramaCargaData;
}

// Objeto completo que se guarda o envía al backend
export interface ProyectoCompletoParaGuardar {
  datosEntrada: DatosFormularioProyecto;
  resultados: ResultadosCalculo;
}

// Interfaz para la respuesta de simulación (Usada por el ProjectService)
export interface RespuestaSimulacion {
  resultados: ResultadosCalculo;
}

export interface Recomendacion {
  texto: string;
  prioridad: 1 | 2 | 3;
  tipo: 'reducir_largo_carroceria' | 'ajustar_separacion' | 'mover_cargas_extra' | 'desplazar_eje' | 'modificar_chasis' | 'cambiar_a_6x2' | 'mayor_pbt' | 'revisar_configuracion';
}