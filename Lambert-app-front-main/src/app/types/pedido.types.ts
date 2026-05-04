// Datos básicos de un cliente
export interface Cliente {
  cuit: number;
  razon_social: string;
}

// Objeto que el front envía al backend para crear un pedido
export interface PedidoDto {
  es_modificado: boolean;
  datosEntrada: {
    cliente: { cuit: number; razon_social: string };
    vendedor: { id: number; nombre: string };
    camion: any;
    configuracion: any;
    carroceria: any;
    cargas_extra?: any[];
  };
  resultados: any;

}

// Objeto que el backend devuelve al guardar un pedido
export interface PedidoResponse {
  id: number;
  fk_id_camion: number | null;
  fk_cuit_cliente: string;
  fk_id_vendedor: number;
  estado: string;
  observaciones: string;
  resultados: any;
}

// Objeto que el backend devuelve al listar pedidos (endpoint /api/admin/pedidos)
export interface PedidoListado {
  id: number;
  cliente_razon_social: string;
  camion: string;
  estado: string;
  fecha_entrega: string;
  es_modificado: boolean;
  configuracion: {
    distancia_entre_ejes: number;
    distancia_primer_eje_espalda_cabina: number;
    voladizo_delantero: number;
    voladizo_trasero: number;
    peso_eje_delantero: number;
    peso_eje_trasero: number;
    pbt: number;
    ancho_chasis_1: number;
    ancho_chasis_2: number;
  };
  calculos: {
    resultado_peso_bruto_total_maximo: number;
    resultado_modificacion_chasis: string;
    resultado_largo_final_camion: number;
    verificacion_distribucion_carga_ok: boolean;
    verificacion_voladizo_trasero_ok: boolean;
    recomendaciones: string;
  };
}

export interface PedidoDetalle {
  id: number;
  cliente_razon_social: string;
  cuit: string;
  estado: string;
  fecha_entrega: string | null;
  es_modificado: boolean;

  camion: {
    id?: number; // en original viene, en modificado no
    marca_camion: string;
    modelo_camion: string;
    ano_camion?: string; // solo en modificado
    tipo_camion: string;
  };

  configuracion: {
    distancia_entre_ejes: number;
    distancia_primer_eje_espalda_cabina: number;
    voladizo_delantero: number;
    voladizo_trasero: number;
    peso_eje_delantero: number;
    peso_eje_trasero: number;
    ancho_chasis_1: number;
    ancho_chasis_2: number | null;
    pbt: number;
    es_modificado: boolean;
  };

  carroceria: {
    tipo_carroceria: string;
    largo_carroceria: number;
    alto_carroceria: number;
    ancho_carroceria: number;
    separacion_cabina_carroceria: number;
    equipo_frio_marca_modelo: string;
  };

  cargas_extra?: {
    descripcion: string;
    peso: number;
    distancia_eje_delantero: number;
  }[];

  // Resultados técnicos (planos, pueden venir null en modificado)
  resultado_peso_bruto_total_maximo: number | null;
  resultado_carga_eje_delantero_calculada: number | null;
  resultado_carga_eje_trasero_calculada: number | null;
  resultado_carga_total_calculada: number | null;
  resultado_centro_carga_total: number | null;
  resultado_centro_carga_carroceria: number | null;
  resultado_nueva_distancia_entre_ejes: number | null;
  resultado_desplazamiento_eje: number | null;
  resultado_modificacion_chasis: string | null;
  resultado_voladizo_trasero_calculado: number | null;
  resultado_largo_final_camion: number | null;
  resultado_carga_maxima_eje_delantero: number | null;
  resultado_carga_maxima_eje_trasero: number | null;

  // Verificaciones
  verificacion_distribucion_carga_ok: boolean | null;
  verificacion_voladizo_trasero_ok: boolean | null;

  // Recomendaciones (objetos normalizados)
  recomendaciones?: { texto: string; prioridad: number; tipo: string }[];
}
