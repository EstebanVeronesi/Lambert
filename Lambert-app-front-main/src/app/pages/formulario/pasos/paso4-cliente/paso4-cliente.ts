import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoService } from '../../../../services/pedido.service';
import { Cliente, PedidoDto } from '../../../../types/pedido.types';
import { DatosFormularioProyecto } from '../../../../types/proyecto.types';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-paso4-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paso4-cliente.html'
})
export class Paso4ClienteComponent {
  @Input() datosProyecto!: DatosFormularioProyecto; // Objeto armado en FormularioComponent
  @Input() esModificado: boolean = false
  @Input() resultados!: any; // Resultados del Paso 3

  clientes: Cliente[] = [];
  clienteSeleccionado: Cliente | null = null;
  cargando = false;
  error: string | null = null;
  private toastService = inject(ToastService);

  constructor(private pedidoService: PedidoService, private router: Router) {}

  ngOnInit(): void {
    this.obtenerClientes();
  }

  obtenerClientes(): void {
    this.cargando = true;
    this.pedidoService.getClientes()
      .subscribe({
        next: (data) => {
          this.clientes = data;
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al cargar clientes';
          this.cargando = false;
        }
      });
  }

  guardarPedido(): void {
    if (!this.clienteSeleccionado || !this.resultados || !this.datosProyecto) return;

    this.datosProyecto.cliente = { ...this.clienteSeleccionado, cuit: Number(this.clienteSeleccionado.cuit) };
    this.datosProyecto.configuracion.es_modificado = this.esModificado;

    const pedidoDto: PedidoDto = {
      es_modificado: this.esModificado,
      datosEntrada: this.datosProyecto!,
      resultados: this.resultados
    };

    console.log('DEBUG pedidoDto', pedidoDto);

    this.pedidoService.guardarPedido(pedidoDto)
      .subscribe({
        next: (res: any) => {
          this.toastService.success('Pedido guardado correctamente');
          this.router.navigate(['/mis-pedidos', res.pedido_id || res.id]);
        },
        error: (err) => {
          const detalles = err?.error?.detalles;
          const msg = Array.isArray(detalles) && detalles.length > 0
            ? detalles.map((d: any) => d.campo + ': ' + d.mensaje).join(' | ')
            : (err?.error?.error || err?.message || 'Error desconocido');
          console.error('Error guardar pedido:', JSON.stringify(err, null, 2));
          this.toastService.error('Error: ' + msg);}
        });
  }
}
