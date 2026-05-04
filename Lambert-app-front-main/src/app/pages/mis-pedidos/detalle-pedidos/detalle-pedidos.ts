import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../services/pedido.service';
import { FormDataService } from '../../../services/form-data.service';
import { PedidoDetalle } from '../../../types/pedido.types';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb.component';
import { LoginService, User } from '../../../services/auth/login.service';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent, FormsModule, DatePipe],
  templateUrl: './detalle-pedidos.html',
  styleUrls: ['./detalle-pedidos.scss']
})
export class PedidoDetalleComponent implements OnInit {
  pedido: PedidoDetalle | null = null;
  cargando = true;
  currentUser: User | null = null;
  estadoEditable = '';
  fechaEntregaEditable = '';

  // Propiedades para modal de recomendaciones
  recomendacionSeleccionada: { texto: string; prioridad: number; tipo: string } | null = null;
  modalAbierto = false;

  // Lista normalizada de recomendaciones para el template
  recomendacionesLista: { texto: string; prioridad: number; tipo: string }[] = [];

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

  seccionesAbiertas: Record<string, boolean> = {
    cliente: true,
    camion: true,
    configuracion: true,
    carroceria: true,
    resultados: true,
    verificaciones: true,
    recomendaciones: true
  };

  private ordenEstados = ['Pendiente', 'En Producción', 'Entregado'];

  get etapaActual(): string {
    return this.pedido?.estado || '';
  }

  get etapas(): { clave: string; label: string; completado: boolean; fecha?: string }[] {
    const estados = [
      { clave: 'Pendiente', label: 'Solicitado', icono: '📝' },
      { clave: 'En Producción', label: 'En Producción', icono: '🔧' },
      { clave: 'Entregado', label: 'Entregado', icono: '✅' },
      { clave: 'Rechazado', label: 'Rechazado', icono: '❌' },
      { clave: 'Cancelado', label: 'Cancelado', icono: '🚫' },
    ];

    const actual = this.pedido?.estado || '';

    return estados.map(e => ({
      ...e,
      completado: this.isEstadoCompletado(e.clave),
    })).filter(e => {
      if ((e.clave === 'Rechazado' || e.clave === 'Cancelado') && e.clave !== actual) return false;
      return true;
    });
  }

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private loginService: LoginService,
    private toastService: ToastService,
    private router: Router,
    private http: HttpClient,
    private formDataService: FormDataService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.loginService.getCurrentUser();
    const id = this.route.snapshot.paramMap.get('id');
    const esModificado = this.route.snapshot.queryParamMap.get('es_modificado') === 'true';

    if (id) {
      this.pedidoService.getPedidoById(+id, esModificado).subscribe({
        next: (data) => {
          console.log('Detalle recibido:', data);
          console.log('Tipo recomendaciones:', typeof data.recomendaciones, Array.isArray(data.recomendaciones));
          if (data.recomendaciones && Array.isArray(data.recomendaciones)) {
            console.log('Primer elemento:', data.recomendaciones[0]);
            console.log('Tipo primer elemento:', typeof data.recomendaciones[0]);
          }

          this.pedido = data;
          this.estadoEditable = data.estado;
          this.fechaEntregaEditable = data.fecha_entrega || '';

          // Construir lista normalizada separada
          this.recomendacionesLista = [];
          if (data.recomendaciones && Array.isArray(data.recomendaciones)) {
            for (const r of data.recomendaciones) {
              if (typeof r === 'string') {
                try {
                  const parsed = JSON.parse(r);
                  this.recomendacionesLista.push({
                    texto: String(parsed.texto || ''),
                    prioridad: Number(parsed.prioridad || 0),
                    tipo: String(parsed.tipo || '')
                  });
                } catch {
                  this.recomendacionesLista.push({ texto: r, prioridad: 0, tipo: '' });
                }
              } else if (r && typeof r === 'object') {
                const obj = r as Record<string, unknown>;
                this.recomendacionesLista.push({
                  texto: String(obj['texto'] || ''),
                  prioridad: Number(obj['prioridad'] || 0),
                  tipo: String(obj['tipo'] || '')
                });
              }
            }
          }
          console.log('recomendacionesLista:', this.recomendacionesLista);

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar detalle:', err);
          this.cargando = false;
        }
      });
    }
  }

  toggleSeccion(seccion: string): void {
    this.seccionesAbiertas[seccion] = !this.seccionesAbiertas[seccion];
  }

  resimular(): void {
    if (!this.pedido) return;

    const datos = {
      camion: {
        id: this.pedido.camion.id ?? null,
        marca_camion: this.pedido.camion.marca_camion,
        modelo_camion: this.pedido.camion.modelo_camion,
        ano_camion: this.pedido.camion.ano_camion ?? '',
        tipo_camion: this.pedido.camion.tipo_camion as '4x2' | '6x2'
      },
      configuracion: this.pedido.configuracion,
      carroceria: this.pedido.carroceria,
      cargas_extra: this.pedido.cargas_extra || []
    };

    this.formDataService.setDatosReSimulacion(datos);
    this.router.navigate(['/formulario'], { queryParams: { resimular: 'true' } });
  }

  confirmarEliminar(): void {
    if (!this.pedido) return;
    if (confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) {
      this.http.delete(`http://localhost:3000/api/admin/pedidos/${this.pedido.id}`, {
        body: { es_modificado: this.pedido.es_modificado },
        withCredentials: true
      }).subscribe({
        next: () => {
          this.toastService.success('Pedido eliminado');
          this.router.navigate(['/mis-pedidos']);
        },
        error: () => this.toastService.error('Error al eliminar')
      });
    }
  }

  getEstadoClass(estado: string): string {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('pendiente')) return 'estado-pendiente';
    if (estadoLower.includes('producción')) return 'estado-produccion';
    if (estadoLower.includes('entregado')) return 'estado-entregado';
    if (estadoLower.includes('rechazado') || estadoLower.includes('cancelado')) return 'estado-rechazado';
    return 'estado-default';
  }

  isEstadoCompletado(estado: string): boolean {
    if (!this.pedido) return false;
    const indexActual = this.ordenEstados.indexOf(this.pedido.estado);
    const indexBuscar = this.ordenEstados.indexOf(estado);
    return indexBuscar < indexActual;
  }

  actualizarEstado(): void {
    if (!this.pedido) return;
    this.http.put(
      `http://localhost:3000/api/admin/pedidos/${this.pedido.id}`,
      { estado: this.estadoEditable, es_modificado: this.pedido.es_modificado },
      { withCredentials: true }
    ).subscribe({
      next: () => this.toastService.success('Estado actualizado'),
      error: () => this.toastService.error('Error al actualizar estado')
    });
  }

  actualizarFechaEntrega(): void {
    if (!this.pedido) return;
    this.http.put(
      `http://localhost:3000/api/admin/pedidos/${this.pedido.id}`,
      { fecha_entrega: this.fechaEntregaEditable, es_modificado: this.pedido.es_modificado },
      { withCredentials: true }
    ).subscribe({
      next: () => this.toastService.success('Fecha de entrega actualizada'),
      error: () => this.toastService.error('Error al actualizar fecha')
    });
  }

  imprimirSimulacion(): void {
    const id = this.pedido?.id;
    const esModificado = this.pedido?.es_modificado;
    const url = `/mis-pedidos/${id}/imprimir?es_modificado=${esModificado}`;
    const ventana = window.open(url, '_blank', 'width=900,height=800');
    if (ventana) {
      ventana.onload = () => setTimeout(() => ventana.print(), 500);
    }
  }

  // Abrir modal de recomendacion
  abrirModal(recomendacion: { texto: string; prioridad: number; tipo: string }): void {
    this.recomendacionSeleccionada = recomendacion;
    this.modalAbierto = true;
  }

  // Cerrar modal de recomendacion
  cerrarModal(): void {
    this.modalAbierto = false;
    this.recomendacionSeleccionada = null;
  }

  // Obtener descripcion completa de una recomendacion
  getDescripcion(tipo: string): { titulo: string; descripcion: string; imagen: string } {
    return this.descripciones[tipo] || this.descripciones['revisar_configuracion'];
  }

  // Obtener clase CSS del badge segun prioridad
  getBadgeClass(prioridad: number): string {
    switch (prioridad) {
      case 1: return 'badge bg-success';
      case 2: return 'badge bg-warning text-dark';
      case 3: return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}
