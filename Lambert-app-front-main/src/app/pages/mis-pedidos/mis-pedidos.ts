import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { PedidoListado } from '../../types/pedido.types';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { LoginService, User } from '../../services/auth/login.service';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbComponent, PaginationComponent],
  templateUrl: './mis-pedidos.html',
  styleUrls: ['./mis-pedidos.scss']
})
export class MisPedidosComponent implements OnInit {
  pedidos: PedidoListado[] = [];
  filteredPedidos: PedidoListado[] = [];
  errorCarga: string = '';
  cargando = true;
  filtro = '';
  filtroEstado = '';
  page = 1;
  pageSize = 10;
  currentUser: User | null = null;

  constructor(
    private pedidoService: PedidoService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.loginService.getCurrentUser();
    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.filteredPedidos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.errorCarga = 'Error al cargar los pedidos. Verificá tu conexión.';
        this.cargando = false;
      }
    });
  }

  filtrar(): void {
    const term = this.filtro.toLowerCase();
    this.filteredPedidos = this.pedidos.filter(p =>
      (p.cliente_razon_social?.toLowerCase().includes(term) || '') ||
      p.camion?.toLowerCase().includes(term)
    );
    if (this.filtroEstado) {
      this.filteredPedidos = this.filteredPedidos.filter(p => p.estado === this.filtroEstado);
    }
    this.page = 1;
  }

  filtrarPorEstado(estado: string): void {
    this.filtroEstado = estado;
    const term = this.filtro.toLowerCase();
    this.filteredPedidos = this.pedidos.filter(p => {
      const matchText = (p.cliente_razon_social?.toLowerCase().includes(term) || '') ||
        p.camion?.toLowerCase().includes(term);
      const matchEstado = estado === '' || p.estado === estado;
      return matchText && matchEstado;
    });
    this.page = 1;
  }

  get paginatedItems(): PedidoListado[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredPedidos.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPedidos.length / this.pageSize);
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
  }

  exportarPDF(): void {
    window.open('/mis-pedidos/exportar', '_blank', 'width=900,height=700');
  }
}