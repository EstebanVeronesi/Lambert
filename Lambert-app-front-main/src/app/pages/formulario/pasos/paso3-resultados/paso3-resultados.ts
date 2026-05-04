import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectoService } from '../../../../services/proyecto.service';
import { DatosFormularioProyecto, ResultadosCalculo, Recomendacion, DiagramaCargaData } from '../../../../types/proyecto.types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-paso3-resultados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paso3-resultados.html',
  styleUrls: ['./paso3-resultados.scss']
})
export class Paso3ResultadosComponent implements OnInit {

  @Input() datosProyecto!: DatosFormularioProyecto;
  @Output() modificar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<ResultadosCalculo>();
  @Output() siguiente = new EventEmitter<void>();

  resultados: ResultadosCalculo | null = null;
  cargando = true;
  error = '';
  mostrarDetalles = false;
  recomendacionSeleccionada: Recomendacion | null = null;
  modalAbierto = false;

  // Referencia a Math para usar en el template
  Math = Math;

  // Constantes para el diagrama SVG
  private readonly SVG_PADDING = 50;
  private readonly SVG_WIDTH = 700;
  private readonly SVG_HEIGHT = 220;
  private readonly ESCALA = this.SVG_WIDTH / 1000; // Se ajusta dinámicamente según largoTotal

  // Getter para obtener el diagrama de carga
  get diagrama(): DiagramaCargaData | null {
    return this.resultados?.diagramaCarga || null;
  }

  // Calcula la escala basada en el largo total del camión
  private getScale(): number {
    if (!this.diagrama) return 1;
    return (this.SVG_WIDTH - 2 * this.SVG_PADDING) / this.diagrama.largoTotal;
  }

  // Convierte una posición en mm a coordenada X del SVG
  getX(posicion: number): number {
    if (!this.diagrama) return 0;
    const scale = this.getScale();
    return this.SVG_PADDING + posicion * scale;
  }

  // Calcula el ancho en SVG a partir de dos posiciones en mm
  getWidth(inicio: number, fin: number): number {
    return Math.abs(fin - inicio) * this.getScale();
  }

  // Calcula el centro X en SVG a partir de dos posiciones en mm
  getCenterX(inicio: number, fin: number): number {
    return this.getX((inicio + fin) / 2);
  }

  // Genera el viewBox dinámico para el SVG
  getViewBox(): string {
    if (!this.diagrama) return `0 0 ${this.SVG_WIDTH} ${this.SVG_HEIGHT}`;
    const scale = this.getScale();
    const width = this.diagrama.largoTotal * scale + 2 * this.SVG_PADDING;
    return `0 0 ${width} ${this.SVG_HEIGHT}`;
  }

  // Genera los puntos del triángulo de flecha para indicar carga
  getArrowPoints(x: number, y: number): string {
    const arrowWidth = 12;
    const arrowHeight = 10;
    return `${x},${y} ${x - arrowWidth / 2},${y - arrowHeight} ${x + arrowWidth / 2},${y - arrowHeight}`;
  }

  // Mapa de descripciones detalladas para cada tipo de recomendacion
  private descripciones: Record<string, { titulo: string; descripcion: string; imagen: string }> = {
    reducir_largo_carroceria: {
      titulo: 'Reducir largo de carrocería',
      descripcion: 'Cuando el voladizo trasero excede el 60% de la distancia entre ejes, la normativa lo considera inseguro. Reducir el largo de la carrocería disminuye directamente el voladizo. La cantidad indicada (en mm) es exactamente el exceso detectado. Esta es la solución más directa porque no requiere modificar la estructura del chasis ni la posición de los ejes.',
      imagen: 'assets/img/soluciones/reducir-largo-carroceria.svg'
    },
    ajustar_separacion: {
      titulo: 'Ajustar separación cabina-carrocería',
      descripcion: 'Reducir la distancia entre la cabina y la carrocería disminuye directamente el voladizo trasero. El voladizo se calcula como: (distancia cabina + separación + largo carrocería) - distancia entre ejes. Cada mm que reduzcas la separación, reduces el voladizo en 1 mm. Esta solución es útil cuando no se puede cambiar el largo de la carrocería.',
      imagen: 'assets/img/soluciones/ajustar-separacion.svg'
    },
    mover_cargas_extra: {
      titulo: 'Mover cargas extra',
      descripcion: 'Las cargas adicionales (equipos, accesorios) afectan el centro de carga total del vehículo. Aunque no modifican la distribución de carga por eje (que depende del PBT y los pesos del chasis), sí influyen en el centro de carga y en la nueva distancia entre ejes calculada. Reposicionarlas puede ayudar a optimizar el diseño general.',
      imagen: 'assets/img/soluciones/mover-cargas-extra.svg'
    },
    desplazar_eje: {
      titulo: 'Desplazar eje trasero',
      descripcion: 'Mover el eje trasero cambia la distancia entre ejes, lo que afecta tanto el voladizo como la distribución de carga. Es una solución estructural que requiere cortar y soldar el chasis. El desplazamiento indicado (en mm) es el calculado por la fórmula de equilibrio de momentos. Se recomienda como segunda opción después de agotar las soluciones de PRIORIDAD 1.',
      imagen: 'assets/img/soluciones/desplazar-eje.svg'
    },
    modificar_chasis: {
      titulo: 'Modificar longitud del chasis',
      descripcion: 'Alargar o cortar el chasis es necesario cuando la carrocería no coincide con la longitud disponible. Se calcula comparando la longitud necesaria (desde el eje delantero hasta el final de la carrocería) con la longitud disponible del chasis. Es una solución estructural que requiere fabricación especializada.',
      imagen: 'assets/img/soluciones/modificar-chasis.svg'
    },
    cambiar_a_6x2: {
      titulo: 'Cambiar a camión 6x2',
      descripcion: 'Los camiones 6x2 (trieje) tienen un porcentaje de carga en el eje delantero del 25%, mientras que los 4x2 requieren 36%. Si la distribución de carga está POR ENCIMA del máximo permitido (ej: 40% > 36%), cambiar a un 6x2 reduce el porcentaje en el eje delantero porque la carga se distribuye entre más ejes traseros. Esta solución NO aplica si el porcentaje está por debajo del mínimo.',
      imagen: 'assets/img/soluciones/cambiar-a-6x2.svg'
    },
    mayor_pbt: {
      titulo: 'Ajustar PBT o cambiar camión',
      descripcion: 'El porcentaje de distribución de carga se calcula mediante la fórmula de momentos de palanca: el peso real sobre cada eje depende del PBT, la tara de los ejes, la distancia entre ejes, el largo y posición de la carrocería, y las cargas extra. Si el porcentaje está fuera de norma, se puede ajustar el PBT o cambiar a un camión con diferentes taras de eje. Si el PBT necesario supera el máximo normativo, este camión no puede cumplir la norma con esta configuración.',
      imagen: 'assets/img/soluciones/mayor-pbt.svg'
    },
    revisar_configuracion: {
      titulo: 'Revisar configuración',
      descripcion: 'Cuando no se puede determinar una solución automática, se recomienda revisar manualmente todos los parámetros de configuración. Verificar que las dimensiones ingresadas sean correctas, que las cargas extra estén bien posicionadas, y consultar con el área de ingeniería para una evaluación personalizada.',
      imagen: 'assets/img/soluciones/revisar-configuracion.svg'
    }
  };

  constructor(private proyectoService: ProyectoService) {}

  async ngOnInit() {
    console.log('Datos recibidos en Paso 3:', this.datosProyecto);

    try {
      const resp = await firstValueFrom(this.proyectoService.simularProyecto(this.datosProyecto));
      this.resultados = resp;
      this.cargando = false;

    } catch (err) {
      console.error('Error en la simulación:', err);
      this.error = 'No se pudieron calcular los resultados.';
      this.cargando = false;
    }
  }

  alternarDetalles() {
    this.mostrarDetalles = !this.mostrarDetalles;
  }

  volverAModificar() {
    this.modificar.emit();
  }

guardarProyecto() {
    if (this.resultados) {
      this.guardar.emit(this.resultados);
      this.siguiente.emit();
    }
  }

  abrirModal(recomendacion: Recomendacion): void {
    this.recomendacionSeleccionada = recomendacion;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.recomendacionSeleccionada = null;
  }

  getDescripcion(tipo: string) {
    return this.descripciones[tipo] || this.descripciones['revisar_configuracion'];
  }

  getBadgeClass(prioridad: number): string {
    switch (prioridad) {
      case 1: return 'badge bg-success';
      case 2: return 'badge bg-warning text-dark';
      case 3: return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

}
