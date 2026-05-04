import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../services/pedido.service';
import { Cliente } from '../../../types/pedido.types';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-alta-cliente',
  templateUrl: './alta-clientes.html',
  styleUrls: ['./alta-clientes.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BreadcrumbComponent],
})
export class AltaClienteComponent {
  cliente: Cliente = { cuit: 0, razon_social: '' };
  cargando = false;
  error: string | null = null;

  constructor(private pedidoService: PedidoService, private router: Router) {}

  guardarCliente(): void {
    this.cargando = true;
    this.pedidoService.crearCliente(this.cliente).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/clientes']);
      },
      error: () => {
        this.error = 'Error al guardar cliente';
        this.cargando = false;
      }
    });
  }
}