// src/schemas/proyecto.schema.ts
import { z } from 'zod';

// --- CargaExtra ---
const cargaExtraSchema = z.object({
  descripcion: z.string().min(1, 'La descripción de la carga extra no puede estar vacía'),
  peso: z.number().positive('El peso de la carga extra debe ser un número positivo'),
  distancia_eje_delantero: z
    .number()
    .positive('La distancia al eje delantero debe ser un número positivo'),
});

// --- DatosFormularioProyecto ---
export const datosFormularioProyectoSchema = z.object({
  cliente: z.object({
    cuit: z.number(),
    razon_social: z.string(),
  }).partial().optional(),
  vendedor: z.object({
    id: z.number(),
    nombre: z.string(),
  }).partial().optional(),
  camion: z.object({
    id: z.number().positive().nullable().optional(),
    marca_camion: z.string().min(1, 'La marca del camión no puede estar vacía'),
    modelo_camion: z.string().min(1, 'El modelo del camión no puede estar vacío'),
    ano_camion: z.string().min(1, 'El año del camión no puede estar vacío'),
    tipo_camion: z.enum(['4x2', '6x2'], {
      message: "El tipo de camión debe ser '4x2' o '6x2'",
    }),
  }),
  configuracion: z.object({
    distancia_entre_ejes: z
      .number()
      .positive('La distancia entre ejes debe ser un número positivo'),
    distancia_primer_eje_espalda_cabina: z
      .number()
      .positive('La distancia primer eje-espalda cabina debe ser un número positivo'),
    voladizo_delantero: z
      .number()
      .positive('El voladizo delantero debe ser un número positivo'),
    voladizo_trasero: z
      .number()
      .positive('El voladizo trasero debe ser un número positivo'),
    peso_eje_delantero: z
      .number()
      .positive('El peso del eje delantero debe ser un número positivo'),
    peso_eje_trasero: z
      .number()
      .positive('El peso del eje trasero debe ser un número positivo'),
    ancho_chasis_1: z
      .number()
      .positive('El ancho de chasis 1 debe ser un número positivo'),
    ancho_chasis_2: z.number().positive().nullable().optional(),
    pbt: z
      .number()
      .positive('El PBT debe ser un número positivo'),
    original: z.boolean().optional(),
    es_modificado: z.boolean().optional(),
  }),
  carroceria: z.object({
    tipo_carroceria: z.enum(['Metálica', 'Térmica'], {
      message: "El tipo de carrocería debe ser 'Metálica' o 'Térmica'",
    }),
    largo_carroceria: z
      .number()
      .positive('El largo de carrocería debe ser un número positivo'),
    alto_carroceria: z
      .number()
      .positive('El alto de carrocería debe ser un número positivo'),
    ancho_carroceria: z
      .number()
      .positive('El ancho de carrocería debe ser un número positivo'),
    separacion_cabina_carroceria: z
      .number()
      .positive('La separación cabina-carrocería debe ser un número positivo'),
    equipo_frio_marca_modelo: z.string().optional(),
  }),
  cargas_extra: z.array(cargaExtraSchema).optional(),
});

// --- ResultadosCalculo ---
const resultadosCalculoSchema = z.object({
  resultado_peso_bruto_total_maximo: z.number(),
  resultado_carga_eje_delantero_calculada: z.number(),
  resultado_carga_eje_trasero_calculada: z.number(),
  resultado_porcentaje_carga_eje_delantero: z.number(),
  resultado_modificacion_chasis: z.string(),
  resultado_voladizo_trasero_calculado: z.number(),
  resultado_largo_final_camion: z.number(),
  resultado_centro_carga_total: z.number(),
  resultado_centro_carga_carroceria: z.number(),
  resultado_nueva_distancia_entre_ejes: z.number(),
  resultado_desplazamiento_eje: z.number(),
  verificacion_distribucion_carga_ok: z.boolean(),
  verificacion_voladizo_trasero_ok: z.boolean(),
  verificacion_largo_total_equipo_ok: z.boolean().optional(),
  recomendaciones: z.array(z.object({
    texto: z.string(),
    prioridad: z.number(),
    tipo: z.string(),
  })),
  camposConError: z.array(z.string()).optional(),
});

// --- ProyectoCompletoParaGuardar ---
export const proyectoCompletoParaGuardarSchema = z.object({
  es_modificado: z.boolean().optional(),
  datosEntrada: datosFormularioProyectoSchema,
  resultados: resultadosCalculoSchema,
});

// Tipos inferidos
export type DatosFormularioProyectoValidado = z.infer<typeof datosFormularioProyectoSchema>;
export type ProyectoCompletoValidado = z.infer<typeof proyectoCompletoParaGuardarSchema>;
