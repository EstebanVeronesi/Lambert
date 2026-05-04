import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../services/pedido.service';
import { PedidoDetalle } from '../../../types/pedido.types';

@Component({
  selector: 'app-imprimir-pedido',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="print-container" *ngIf="pedido && !cargando">
      <!-- Encabezado -->
      <div class="print-header">
        <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px;">
          <span style="font-size:28px;font-weight:700;color:#159947;">LAMBERT</span>
        </div>
        <h2 style="font-size:16px;font-weight:600;color:#262626;margin:0 0 4px;">Simulación Técnica de Carrocería</h2>
        <p style="font-size:12px;color:#6b7280;margin:0;">Pedido #{{ pedido.id }} | {{ pedido.fecha_entrega || 'Sin fecha' }}</p>
        <hr />
      </div>

      <!-- Cliente -->
      <h3>1. Datos del Cliente</h3>
      <table class="print-table">
        <tr><td class="label">Razón Social:</td><td>{{ pedido.cliente_razon_social }}</td></tr>
        <tr><td class="label">CUIT:</td><td>{{ pedido.cuit }}</td></tr>
        <tr><td class="label">Estado:</td><td>{{ pedido.estado }}</td></tr>
      </table>

      <!-- Camión -->
      <h3>2. Datos del Camión</h3>
      <table class="print-table">
        <tr><td class="label">Marca:</td><td>{{ pedido.camion.marca_camion }}</td></tr>
        <tr><td class="label">Modelo:</td><td>{{ pedido.camion.modelo_camion }}</td></tr>
        <tr><td class="label">Año:</td><td>{{ pedido.camion.ano_camion || '—' }}</td></tr>
        <tr><td class="label">Tipo:</td><td>{{ pedido.camion.tipo_camion }}</td></tr>
      </table>

      <!-- Configuración Técnica -->
      <h3>3. Configuración Técnica</h3>
      <table class="print-table">
        <tr><td class="label">Distancia entre ejes:</td><td>{{ pedido.configuracion.distancia_entre_ejes | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Dist. 1er eje espalda cabina:</td><td>{{ pedido.configuracion.distancia_primer_eje_espalda_cabina | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Voladizo delantero:</td><td>{{ pedido.configuracion.voladizo_delantero | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Voladizo trasero:</td><td>{{ pedido.configuracion.voladizo_trasero | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Peso eje delantero:</td><td>{{ pedido.configuracion.peso_eje_delantero | number:'1.0-0' }} kg</td></tr>
        <tr><td class="label">Peso eje trasero:</td><td>{{ pedido.configuracion.peso_eje_trasero | number:'1.0-0' }} kg</td></tr>
        <tr><td class="label">PBT:</td><td>{{ pedido.configuracion.pbt | number:'1.0-0' }} kg</td></tr>
      </table>

      <!-- Carrocería -->
      <h3>4. Carrocería</h3>
      <table class="print-table">
        <tr><td class="label">Tipo:</td><td>{{ pedido.carroceria.tipo_carroceria }}</td></tr>
        <tr><td class="label">Largo:</td><td>{{ pedido.carroceria.largo_carroceria | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Alto:</td><td>{{ pedido.carroceria.alto_carroceria | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Ancho:</td><td>{{ pedido.carroceria.ancho_carroceria | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Separación cabina:</td><td>{{ pedido.carroceria.separacion_cabina_carroceria | number:'1.0-0' }} mm</td></tr>
      </table>

      <!-- Resultados -->
      <h3>5. Resultados Técnicos</h3>
      <table class="print-table">
        <tr><td class="label">PBT máximo:</td><td>{{ pedido.resultado_peso_bruto_total_maximo | number:'1.0-0' }} kg</td></tr>
        <tr><td class="label">Carga eje delantero:</td><td>{{ pedido.resultado_carga_eje_delantero_calculada | number:'1.0-0' }} kg</td></tr>
        <tr><td class="label">Carga eje trasero:</td><td>{{ pedido.resultado_carga_eje_trasero_calculada | number:'1.0-0' }} kg</td></tr>
        <tr><td class="label">Centro de carga total:</td><td>{{ pedido.resultado_centro_carga_total | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Centro de carga carrocería:</td><td>{{ pedido.resultado_centro_carga_carroceria | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Nueva distancia entre ejes:</td><td>{{ pedido.resultado_nueva_distancia_entre_ejes | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Desplazamiento eje:</td><td>{{ pedido.resultado_desplazamiento_eje | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Modificación chasis:</td><td>{{ pedido.resultado_modificacion_chasis }}</td></tr>
        <tr><td class="label">Voladizo trasero:</td><td>{{ pedido.resultado_voladizo_trasero_calculado | number:'1.0-0' }} mm</td></tr>
        <tr><td class="label">Largo final:</td><td>{{ pedido.resultado_largo_final_camion | number:'1.0-0' }} mm</td></tr>
      </table>

      <!-- Verificaciones -->
      <h3>6. Verificaciones</h3>
      <table class="print-table">
        <tr>
          <td class="label">Distribución de carga:</td>
          <td [style.color]="pedido.verificacion_distribucion_carga_ok ? '#159947' : '#da251d'">
            {{ pedido.verificacion_distribucion_carga_ok ? '✓ Cumple norma' : '✗ Fuera de norma' }}
          </td>
        </tr>
        <tr>
          <td class="label">Voladizo trasero:</td>
          <td [style.color]="pedido.verificacion_voladizo_trasero_ok ? '#159947' : '#da251d'">
            {{ pedido.verificacion_voladizo_trasero_ok ? '✓ Cumple norma' : '✗ Excedido' }}
          </td>
        </tr>
      </table>

      <!-- Recomendaciones -->
      <div *ngIf="pedido.recomendaciones?.length">
        <h3>7. Recomendaciones</h3>
        <ul>
          <li *ngFor="let r of pedido.recomendaciones">{{ r.texto || r }}</li>
        </ul>
      </div>

      <div class="print-footer">
        <hr />
        <p>Documento generado por Lambert — Software de Diseño de Carrocerías</p>
        <p>Sesión del {{ fechaActual | date:'dd/MM/yyyy HH:mm' }}</p>
      </div>
    </div>

    <div *ngIf="cargando" class="text-center p-5">Cargando...</div>
  `,
  styles: [`
    .print-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      font-family: 'Inter', system-ui, sans-serif;
      color: #262626;
      font-size: 13px;
      line-height: 1.6;
    }
    .print-header { text-align: center; margin-bottom: 20px; }
    .print-header p { margin: 0; color: #6b7280; font-size: 12px; }
    h3 { font-size: 14px; color: #159947; margin: 20px 0 10px; border-bottom: 1px solid #e9ecef; padding-bottom: 4px; }
    .print-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .print-table td { padding: 4px 8px; border-bottom: 1px solid #f0f0f0; }
    .print-table .label { font-weight: 600; width: 220px; color: #6b7280; }
    .print-footer { text-align: center; font-size: 11px; color: #aaa; margin-top: 20px; }
    ul { margin: 4px 0; padding-left: 20px; }
    li { margin: 3px 0; }

    @media print {
      .print-container { padding: 20px; }
      @page { margin: 15mm; size: A4; }
    }
  `]
})
export class ImprimirPedidoComponent implements OnInit {
  pedido: PedidoDetalle | null = null;
  cargando = true;
  fechaActual = new Date();

  constructor(private route: ActivatedRoute, private pedidoService: PedidoService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const esModificado = this.route.snapshot.queryParamMap.get('es_modificado') === 'true';
    if (id) {
      this.pedidoService.getPedidoById(+id, esModificado).subscribe({
        next: (data) => { this.pedido = data; this.cargando = false; setTimeout(() => window.print(), 300); },
        error: () => { this.cargando = false; }
      });
    }
  }
}
