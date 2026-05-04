import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../services/pedido.service';
import { PedidoListado } from '../../../types/pedido.types';

@Component({
  selector: 'app-exportar-pedidos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="print-container">
      <div class="print-header">
        <h1>Lambert — Listado de Pedidos</h1>
        <p>Fecha: {{ fechaActual | date:'dd/MM/yyyy' }}</p>
        <hr />
      </div>
      <table class="print-table" *ngIf="pedidos.length">
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Camión</th>
            <th>Estado</th>
            <th>Entrega</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of pedidos">
            <td>{{ p.id }}</td>
            <td>{{ p.cliente_razon_social }}</td>
            <td>{{ p.camion }}</td>
            <td>{{ p.estado }}</td>
            <td>{{ p.fecha_entrega || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!pedidos.length" class="text-center">No hay pedidos para mostrar.</p>
    </div>
  `,
  styles: [`
    .print-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      font-family: 'Inter', sans-serif;
    }
    .print-header { text-align: center; }
    .print-header h1 { font-size: 18px; color: #159947; }
    .print-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .print-table th {
      background: #f4f6f8;
      padding: 8px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
    }
    .print-table td {
      padding: 8px;
      border-bottom: 1px solid #eee;
      font-size: 12px;
    }
    .text-center { text-align: center; }
    @media print {
      @page { margin: 10mm; size: A4 landscape; }
    }
  `]
})
export class ExportarPedidosComponent implements OnInit {
  pedidos: PedidoListado[] = [];
  fechaActual = new Date();

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        setTimeout(() => window.print(), 400);
      },
      error: (err) => { console.error('Error al cargar pedidos para exportar:', err); }
    });
  }
}
