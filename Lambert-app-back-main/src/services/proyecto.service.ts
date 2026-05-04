// src/services/proyecto.service.ts
import { ProyectoRepository } from '../repositories/proyecto.repository';
import { DatosFormularioProyecto, ResultadosCalculo, ProyectoCompletoParaGuardar, Recomendacion, DiagramaCargaData } from '../types/proyecto.types';

// ============================================================================
// Constantes normativas y parámetros fijos
// ============================================================================
const NORMAS = {
  PBT_MAX_4x2: 16500, // kg
  PBT_MAX_6x2: 24000, // kg
  PORCENTAJE_4x2: 36, // %
  PORCENTAJE_6x2: 25, // %
  VOLADIZO_TRASERO_MAX_PORCENTAJE: 0.60, // 60% de la distancia entre ejes
  TOLERANCIA_CHASIS: 10, // mm de margen para considerar "sin cambio"
};

interface RecomendacionesOutput {
  observaciones: string[];
  soluciones: Recomendacion[];
}

export class ProyectoService {

  public async generarSimulacion(datos: DatosFormularioProyecto): Promise<ResultadosCalculo> {
    const tipoEntrada = (datos.camion && datos.camion.tipo_camion)
      ? String(datos.camion.tipo_camion).toLowerCase()
      : '4x2';

    const tipo = tipoEntrada === '6x2' ? '6x2' : '4x2';

    // ==========================================================================
    // FASE 0: VARIABLES DE ENTRADA
    // ==========================================================================

    // Límites legales según tipo de camión
    const pbtMaxNormativo = tipo === '6x2' ? NORMAS.PBT_MAX_6x2 : NORMAS.PBT_MAX_4x2;
    const maxEjeDelantero = tipo === '6x2'
      ? pbtMaxNormativo * (NORMAS.PORCENTAJE_6x2 / 100)
      : pbtMaxNormativo * (NORMAS.PORCENTAJE_4x2 / 100);
    const maxEjeTrasero = pbtMaxNormativo - maxEjeDelantero;

    // PBT: menor entre el informado y el normativo
    const pbtEntrada = datos?.configuracion?.pbt;
    const pbt = typeof pbtEntrada === 'number' && !isNaN(pbtEntrada)
      ? Math.min(pbtEntrada, pbtMaxNormativo)
      : pbtMaxNormativo;

    // Medidas del camión
    const taraDelantera = datos.configuracion.peso_eje_delantero;
    const taraTrasera = datos.configuracion.peso_eje_trasero;
    const distEjes = datos.configuracion.distancia_entre_ejes;
    const volDelantero = datos.configuracion.voladizo_delantero;
    const volTrasero = datos.configuracion.voladizo_trasero;
    const espaldaCabina = datos.configuracion.distancia_primer_eje_espalda_cabina;

    // Carrocería y cargas extras
    const sepCabina = datos.carroceria.separacion_cabina_carroceria;
    const largoCarroceria = datos.carroceria.largo_carroceria;
    const cargaExtraTotal = (datos.cargas_extra || []).reduce(
      (sum, c) => sum + (c.peso || 0), 0
    );

    // Centro de masa ponderado de TODAS las cargas extra
    let posCargaExtra = 0;
    if (datos.cargas_extra && datos.cargas_extra.length > 0) {
      const momentoTotalCargas = datos.cargas_extra.reduce((sum, c) =>
        sum + (c.peso || 0) * (c.distancia_eje_delantero || 0), 0);
      posCargaExtra = cargaExtraTotal > 0 ? momentoTotalCargas / cargaExtraTotal : 0;
    }

    // ==========================================================================
    // FASE 1: DIAGNÓSTICO REAL (Fórmula de Oro de Gian — Celda N64)
    // Sumatoria de momentos pivotando sobre el eje trasero
    // ==========================================================================

    // 1. Capacidades útiles
    const capLibreDelantera = maxEjeDelantero - taraDelantera;
    const capLibreTrasera = maxEjeTrasero - taraTrasera;
    const cargaUtilCarroceria = (capLibreDelantera + capLibreTrasera) - cargaExtraTotal;

    // 2. Centro de carga de la carrocería
    const centroCargaCaja = espaldaCabina + sepCabina + (largoCarroceria / 2);

    // 3. FÓRMULA MAESTRA — Peso real en el eje delantero mediante fuerza de palanca
    const momentoCarroceria = cargaUtilCarroceria * (distEjes - centroCargaCaja);
    const momentoTaraDel = taraDelantera * distEjes;
    const momentoCargaExtra = cargaExtraTotal * (distEjes - posCargaExtra);

    const pesoRealDelantero = (momentoCarroceria + momentoTaraDel + momentoCargaExtra) / distEjes;

    // 4. Porcentajes reales
    const porcentajeRealDelantero = (pesoRealDelantero / pbt) * 100;
    const porcentajeRealTrasero = 100 - porcentajeRealDelantero;

    // Cargas calculadas por eje (peso real - tara)
    const cargaEjeDelantero = pesoRealDelantero - taraDelantera;
    const cargaEjeTrasero = (pbt - pesoRealDelantero) - taraTrasera;

    // ==========================================================================
    // FASE 2: SOLUCIÓN — Cálculo del desplazamiento del eje (Celda N54)
    // ==========================================================================

    const momentosCargas = (cargaExtraTotal * posCargaExtra) + (cargaUtilCarroceria * centroCargaCaja);
    const pesoObjetivoTraseroLibre = maxEjeTrasero - taraTrasera;

    const nuevaDistEjes = pesoObjetivoTraseroLibre > 0
      ? momentosCargas / pesoObjetivoTraseroLibre
      : distEjes;

    const desplazamientoEje = nuevaDistEjes - distEjes;

    // ==========================================================================
    // FASE 3: GEOMETRÍA — Chasis y voladizo (Celdas F58, F64, F65, F66)
    // ==========================================================================

    // 1. Alargar o cortar chasis
    const espacioNecesario = espaldaCabina + sepCabina + largoCarroceria;
    const espacioDisponible = distEjes + volTrasero;
    const modifChasis = espacioNecesario - espacioDisponible;

    const modificacionChasisTexto =
      modifChasis > NORMAS.TOLERANCIA_CHASIS
        ? `alargar ${Math.round(modifChasis)} mm el chasis`
        : modifChasis < -NORMAS.TOLERANCIA_CHASIS
          ? `cortar ${Math.abs(Math.round(modifChasis))} mm el chasis`
          : 'Sin cambios';

    // 2. Voladizo trasero resultante
    // a) Sin mover el eje
    const voladizoTraseroCalculado = espacioNecesario - distEjes;

    // b) Con desplazamiento del eje
    const voladizoConDesplazamiento = volTrasero - desplazamientoEje + modifChasis;
    const pctVoladizoConDesplazamiento = nuevaDistEjes > 0
      ? (voladizoConDesplazamiento * 100) / nuevaDistEjes
      : 0;

    // 3. Largo final del camión armado
    const largoTotalCamion = volDelantero + distEjes + volTrasero + modifChasis;

    // Centro de carga total (para diagrama)
    const centroCargaTotal = centroCargaCaja;

    // ==========================================================================
    // VERIFICACIONES
    // ==========================================================================

    const verificacionDistribucion = this.verificarDistribucionCarga(
      tipo,
      porcentajeRealDelantero
    );

    const verificacionVoladizo = this.verificarVoladizoTrasero(
      distEjes,
      voladizoTraseroCalculado
    );

    // ==========================================================================
    // RECOMENDACIONES
    // ==========================================================================

    const recomendaciones = this.generarRecomendaciones(
      verificacionDistribucion,
      verificacionVoladizo,
      modificacionChasisTexto,
      desplazamientoEje,
      {
        cargaExtraTotal,
        posCargaExtra,
        centroCargaCaja,
        distEjes,
        tipo,
        cargasExtraCount: (datos.cargas_extra || []).length,
        cargaEjeDelantero,
        cargaEjeTrasero,
        pbt,
        maxNormativo: pbtMaxNormativo,
        pesoRealDelantero,
        pesoRealTrasero: pbt - pesoRealDelantero,
        taraDelantera,
        taraTrasera,
        maxEjeDelantero,
        maxEjeTrasero,
        nuevaDistEjes,
        pctVoladizoConDesplazamiento,
      }
    );

    // ==========================================================================
    // DIAGRAMA DE CARGA — Datos para renderizado SVG proporcional
    // ==========================================================================

    const diagramaCarga: DiagramaCargaData = {
      posicionEjeDelantero: 0,
      posicionEjeTrasero: distEjes,
      posicionCabinaInicio: -volDelantero,
      posicionCabinaFin: 0,
      posicionCarroceriaInicio: espaldaCabina + sepCabina,
      posicionCarroceriaFin: espaldaCabina + sepCabina + largoCarroceria,
      posicionCentroCargaCarroceria: centroCargaCaja,
      posicionCentroCargaTotal: centroCargaTotal,
      voladizoDelantero: volDelantero,
      voladizoTrasero: voladizoTraseroCalculado,
      largoTotal: largoTotalCamion,
      cargaMaxEjeDelantero: maxEjeDelantero,
      cargaMaxEjeTrasero: maxEjeTrasero,
      pesoEjeDelantero: taraDelantera,
      pesoEjeTrasero: taraTrasera,
      cargaUtilDelantero: cargaEjeDelantero,
      cargaUtilTrasero: cargaEjeTrasero,
      porcentajeUsoEjeDelantero:
        maxEjeDelantero > 0 ? (pesoRealDelantero / maxEjeDelantero) * 100 : 0,
      porcentajeUsoEjeTrasero:
        maxEjeTrasero > 0 ? ((pbt - pesoRealDelantero) / maxEjeTrasero) * 100 : 0,
      cargasExtra: (datos.cargas_extra || []).map((c) => ({
        descripcion: c.descripcion,
        peso: c.peso,
        posicion: c.distancia_eje_delantero,
      })),
      tipoCamion: tipo as '4x2' | '6x2',
    };

    // ==========================================================================
    // RESULTADOS
    // ==========================================================================

    return {
      resultado_peso_bruto_total_maximo: pbt,
      resultado_carga_eje_delantero_calculada: cargaEjeDelantero,
      resultado_carga_eje_trasero_calculada: cargaEjeTrasero,
      resultado_porcentaje_carga_eje_delantero: porcentajeRealDelantero,
      resultado_modificacion_chasis: modificacionChasisTexto,
      resultado_voladizo_trasero_calculado: voladizoTraseroCalculado,
      resultado_largo_final_camion: largoTotalCamion,
      resultado_centro_carga_total: centroCargaTotal,
      resultado_centro_carga_carroceria: centroCargaCaja,
      resultado_nueva_distancia_entre_ejes: nuevaDistEjes,
      resultado_desplazamiento_eje: desplazamientoEje,
      verificacion_distribucion_carga_ok: verificacionDistribucion.ok,
      verificacion_voladizo_trasero_ok: verificacionVoladizo.ok,
      recomendaciones: recomendaciones.soluciones,
      observaciones: recomendaciones.observaciones,
      diagramaCarga,
    };
  }

  // ==========================================================================
  // GUARDAR PROYECTO COMPLETO
  // ==========================================================================
  public async guardarProyectoCompleto(proyecto: ProyectoCompletoParaGuardar): Promise<{ pedido_id: number; calculo_id: number; tipo: string }> {
    try {
      return await ProyectoRepository.create(proyecto);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al guardar el proyecto';
      throw new Error(message);
    }
  }

  // ==========================================================================
  // Validaciones
  // ==========================================================================
  private verificarDistribucionCarga(tipoCamion: string, porcentaje: number) {
    let min = 0, max = 0;
    if (tipoCamion === '4x2') { min = 30; max = 36; }
    if (tipoCamion === '6x2') { min = 23; max = 27; }

    const ok = porcentaje >= min && porcentaje <= max;
    return {
      ok,
      mensaje: ok
        ? `Distribución dentro de norma (${porcentaje.toFixed(1)}%).`
        : `Distribución fuera de norma (${porcentaje.toFixed(1)}%). Debe estar entre ${min}% y ${max}%.`,
      rango: { min, max },
      porcentaje
    };
  }

  private verificarVoladizoTrasero(distEjes: number, voladizo: number) {
    const limite = distEjes * NORMAS.VOLADIZO_TRASERO_MAX_PORCENTAJE;
    const ok = voladizo <= limite;
    const exceso = ok ? 0 : voladizo - limite;

    return {
      ok,
      mensaje: ok
        ? 'Voladizo dentro de norma.'
        : `Voladizo excedido en ${exceso.toFixed(0)} mm (actual: ${voladizo.toFixed(0)} mm, máximo permitido: ${limite.toFixed(0)} mm).`,
      limite,
      voladizo,
      exceso
    };
  }

  private generarRecomendaciones(
    verifCarga: { ok: boolean; mensaje: string; rango?: { min: number; max: number }; porcentaje: number },
    verifVoladizo: { ok: boolean; mensaje: string; limite?: number; voladizo?: number; exceso?: number },
    modifChasis: string,
    desplazamientoEje: number,
    datos?: {
      cargaExtraTotal: number;
      posCargaExtra: number;
      centroCargaCaja: number;
      distEjes: number;
      tipo: string;
      cargasExtraCount: number;
      cargaEjeDelantero: number;
      cargaEjeTrasero: number;
      pbt: number;
      maxNormativo: number;
      pesoRealDelantero: number;
      pesoRealTrasero: number;
      taraDelantera: number;
      taraTrasera: number;
      maxEjeDelantero: number;
      maxEjeTrasero: number;
      nuevaDistEjes: number;
      pctVoladizoConDesplazamiento: number;
    }
  ): RecomendacionesOutput {

    const observaciones: string[] = [];
    const soluciones: Recomendacion[] = [];

    if (verifCarga.ok && verifVoladizo.ok && modifChasis === 'Sin cambios') {
      observaciones.push('El diseño cumple con todas las normativas verificadas.');
      return { observaciones, soluciones };
    }

    // --- Observaciones ---
    if (!verifVoladizo.ok && verifVoladizo.exceso && verifVoladizo.limite !== undefined) {
      observaciones.push(
        `Voladizo trasero excede el máximo permitido en ${Math.round(verifVoladizo.exceso)} mm ` +
        `(actual: ${Math.round(verifVoladizo.voladizo || 0)} mm, máximo: ${Math.round(verifVoladizo.limite)} mm).`
      );
    }

    if (!verifCarga.ok) {
      observaciones.push(`Distribución de carga fuera de norma: ${verifCarga.mensaje}`);
    }

    if (datos && datos.cargaEjeDelantero < 0) {
      observaciones.push(`El eje delantero está sobrecargado en ${Math.round(-datos.cargaEjeDelantero)} kg.`);
    }

    if (datos && datos.cargaEjeTrasero < 0) {
      observaciones.push(`El eje trasero está sobrecargado en ${Math.round(-datos.cargaEjeTrasero)} kg.`);
    }

    const opcionesP1: { texto: string; tipo: Recomendacion['tipo'] }[] = [];
    const opcionesP2: { texto: string; tipo: Recomendacion['tipo'] }[] = [];
    const opcionesP3: { texto: string; tipo: Recomendacion['tipo'] }[] = [];

    // ============================================================
    // PRIORIDAD 1: Soluciones que NO requieren cambiar el camión
    // ============================================================

    // --- Soluciones para voladizo excedido ---
    if (!verifVoladizo.ok && verifVoladizo.exceso) {
      const exceso = verifVoladizo.exceso;

      opcionesP1.push({
        texto: `Reducir el largo de la carrocería en ${Math.round(exceso)} mm.`,
        tipo: 'reducir_largo_carroceria'
      });

      if (datos) {
        const reduccionSepPosible = Math.min(exceso, datos.centroCargaCaja - datos.distEjes * 0.3);
        if (reduccionSepPosible > 10) {
          opcionesP1.push({
            texto: `Reducir la separación cabina-carrocería en ${Math.round(reduccionSepPosible)} mm.`,
            tipo: 'ajustar_separacion'
          });
        }
      }
    }

    // --- Soluciones para distribución fuera de norma ---
    // Con la fórmula de Gian, el porcentaje real depende del PBT, tipo de camión,
    // tara de ejes, carrocería y cargas extra. El desplazamiento del eje SÍ afecta
    // el porcentaje porque cambia la palanca de momentos.
    if (!verifCarga.ok && datos) {
      const rango = verifCarga.rango;
      const porcentajeActual = verifCarga.porcentaje;

      if (rango && porcentajeActual < rango.min) {
        // Porcentaje demasiado bajo → el peso delantero es muy bajo relativo al PBT
        // PBT_nec = pesoRealDelantero / (min/100)
        // Si PBT_nec < PBT_actual → hay que REDUCIR el PBT
        // Si PBT_nec > PBT_actual → hay que AUMENTAR el PBT
        const minRatio = rango.min / 100;
        const pbtNecesario = datos.pesoRealDelantero / minRatio;

        if (pbtNecesario > datos.maxNormativo || !isFinite(pbtNecesario) || pbtNecesario < 0) {
          opcionesP3.push({
            texto: `No es posible cumplir la norma con este camión. Se necesitaría un PBT de ${isFinite(pbtNecesario) && pbtNecesario > 0 ? Math.round(pbtNecesario) : 'imposible'} kg para alcanzar el ${rango.min}%, pero el máximo normativo es ${datos.maxNormativo} kg. Se requiere un camión con menor tara en el eje delantero o mayor tara en el eje trasero.`,
            tipo: 'mayor_pbt'
          });
        } else if (pbtNecesario < datos.pbt) {
          opcionesP3.push({
            texto: `Reducir el PBT a ${Math.round(pbtNecesario)} kg. Con el PBT actual (${datos.pbt} kg), la carga en el eje delantero representa solo ${porcentajeActual.toFixed(1)}% (mínimo ${rango.min}%). Un PBT menor aumenta el porcentaje relativo del peso delantero.`,
            tipo: 'mayor_pbt'
          });
        } else {
          opcionesP3.push({
            texto: `Aumentar el PBT a ${Math.round(pbtNecesario)} kg. Con el PBT actual (${datos.pbt} kg), la carga en el eje delantero es insuficiente (${porcentajeActual.toFixed(1)}% vs mínimo ${rango.min}%).`,
            tipo: 'mayor_pbt'
          });
        }
      } else if (rango && porcentajeActual > rango.max) {
        // Porcentaje demasiado alto → hay que DISMINUIR carga en eje delantero
        if (datos.tipo === '4x2') {
          opcionesP3.push({
            texto: `Considerar cambiar a un camión 6x2. El 4x2 concentra más carga en el eje delantero (${porcentajeActual.toFixed(1)}%). El 6x2 distribuye más carga en los ejes traseros (25% en delantero).`,
            tipo: 'cambiar_a_6x2'
          });
        }
        opcionesP3.push({
          texto: `Reducir el PBT ingresado. Con el PBT actual, la carga en el eje delantero excede el máximo permitido (${porcentajeActual.toFixed(1)}% vs máximo ${rango.max}%).`,
          tipo: 'mayor_pbt'
        });
      }
    }

    // --- Soluciones para carga negativa ---
    if (datos) {
      if (datos.cargaEjeDelantero < 0) {
        opcionesP3.push({
          texto: `El eje delantero está sobrecargado en ${Math.round(-datos.cargaEjeDelantero)} kg. El PBT es insuficiente para la configuración. Aumentar el PBT o seleccionar un camión con menor tara en el eje delantero.`,
          tipo: 'mayor_pbt'
        });
      }
      if (datos.cargaEjeTrasero < 0) {
        opcionesP3.push({
          texto: `El eje trasero está sobrecargado en ${Math.round(-datos.cargaEjeTrasero)} kg. El PBT es insuficiente para la configuración. Aumentar el PBT o seleccionar un camión con menor tara en el eje trasero.`,
          tipo: 'mayor_pbt'
        });
      }
    }

    // ============================================================
    // PRIORIDAD 2: Soluciones que requieren modificar el chasis
    // ============================================================

    if (!verifVoladizo.ok && modifChasis !== 'Sin cambios') {
      opcionesP2.push({
        texto: `${modifChasis} para corregir la longitud del chasis.`,
        tipo: 'modificar_chasis'
      });
    }

    // Recomendación de desplazar el eje (ahora SÍ es válida con la fórmula de Gian)
    if (Math.abs(desplazamientoEje) >= 10 && datos) {
      const sentido = desplazamientoEje > 0 ? 'hacia atrás' : 'hacia adelante';
      const pctVoladizo = datos.pctVoladizoConDesplazamiento;
      const voladizoOk = pctVoladizo <= 60;

      if (voladizoOk) {
        opcionesP2.push({
          texto: `Desplazar el eje trasero ${Math.round(Math.abs(desplazamientoEje))} mm ${sentido}. Esto ajusta la distribución de carga al rango normativo sin exceder el voladizo máximo (${pctVoladizo.toFixed(1)}%).`,
          tipo: 'desplazar_eje'
        });
      } else {
        opcionesP2.push({
          texto: `Desplazar el eje trasero ${Math.round(Math.abs(desplazamientoEje))} mm ${sentido} corrige la distribución, pero el voladizo resultante (${pctVoladizo.toFixed(1)}%) excede el 60% permitido. Se requiere combinar con reducción de carrocería.`,
          tipo: 'desplazar_eje'
        });
      }
    }

    // ============================================================
    // PRIORIDAD 3: Soluciones que requieren cambiar el camión
    // ============================================================

    if ((datos && (datos.cargaEjeDelantero < 0 || datos.cargaEjeTrasero < 0))) {
      opcionesP3.push({
        texto: 'El camión seleccionado no tiene capacidad suficiente para esta configuración. Considerar un modelo con mayor PBT o diferentes taras de eje.',
        tipo: 'mayor_pbt'
      });
    }

    // --- Fallback ---
    if (opcionesP1.length === 0 && opcionesP2.length === 0 && opcionesP3.length === 0) {
      opcionesP1.push({
        texto: 'Revisar los parámetros de configuración y consultar con el área de ingeniería.',
        tipo: 'revisar_configuracion'
      });
    }

    // Construir array de soluciones con prioridad
    opcionesP1.forEach(s => soluciones.push({ ...s, prioridad: 1 }));
    opcionesP2.forEach(s => soluciones.push({ ...s, prioridad: 2 }));
    opcionesP3.forEach(s => soluciones.push({ ...s, prioridad: 3 }));

    return { observaciones, soluciones };
  }
}
