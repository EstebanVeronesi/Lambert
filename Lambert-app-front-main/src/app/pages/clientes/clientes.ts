import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PedidoService } from '../../services/pedido.service';
import { Cliente } from '../../types/pedido.types';
import { LoginService, User } from '../../services/auth/login.service';
import { ToastService } from '../../shared/toast/toast.service';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss'],
  standalone: true,
  imports: [RouterModule, FormsModule, BreadcrumbComponent, PaginationComponent]
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  cargando = false;
  error: string | null = null;
  filtro = '';
  page = 1;
  pageSize = 10;
  currentUser: User | null = null;

  constructor(
    private pedidoService: PedidoService,
    private http: HttpClient,
    private loginService: LoginService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.loginService.getCurrentUser();
    this.obtenerClientes();
  }

  obtenerClientes(): void {
    this.cargando = true;
    this.pedidoService.getClientes()
      .subscribe({
        next: (data) => {
          this.clientes = data;
          this.filteredClientes = data;
          this.cargando = false;
        },
        error: () => {
          this.error = 'Error al cargar clientes';
          this.cargando = false;
        }
      });
  }

  filtrar(): void {
    const term = this.filtro.toLowerCase();
    this.filteredClientes = this.clientes.filter(c =>
      c.razon_social.toLowerCase().includes(term)
    );
    this.page = 1;
  }

  get paginatedItems(): Cliente[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredClientes.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredClientes.length / this.pageSize);
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
  }

  confirmarEliminar(cuit: number): void {
    if (confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) {
      this.http.delete(`http://localhost:3000/api/clientes/${cuit}`, {
        withCredentials: true
      }).subscribe({
        next: () => {
          this.toastService.success('Cliente eliminado');
          this.obtenerClientes();
        },
        error: () => this.toastService.error('Error al eliminar el cliente')
      });
    }
  }
}