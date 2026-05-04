import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/auth/login.service';
import { User } from '../../services/auth/login.service';
import { PedidoService } from '../../services/pedido.service';
import { PedidoListado } from '../../types/pedido.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit {
  userLoginOn = false;
  currentUser: User | null = null;

  pedidos: PedidoListado[] = [];
  cargandoPedidos = true;
  errorPedidos = '';

  constructor(
    private loginService: LoginService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.loginService.currentUserLogInService.subscribe(
      estado => this.userLoginOn = estado
    );

    this.loginService.isLoggedIn().subscribe(
      estado => this.userLoginOn = estado
    );

    this.currentUser = this.loginService.getCurrentUser();

    this.pedidoService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data || [];
        this.cargandoPedidos = false;
      },
      error: (err) => {
        console.error('Error cargando pedidos:', err);
        this.errorPedidos = 'Error al cargar estadísticas';
        this.cargandoPedidos = false;
      }
    });
  }

  get proximasEntregas(): PedidoListado[] {
    const hoy = new Date();
    return this.pedidos
      .filter(p => p.fecha_entrega)
      .map(p => ({ ...p, fecha_entrega_date: new Date(p.fecha_entrega) }))
      .filter(p => (p as any).fecha_entrega_date >= hoy)
      .sort((a: any, b: any) => a.fecha_entrega_date - b.fecha_entrega_date)
      .slice(0, 5);
  }

  get pedidosPendientes(): number {
    return this.pedidos.filter(p => p.estado === 'Pendiente').length;
  }

  get pedidosEnProduccion(): number {
    return this.pedidos.filter(p => p.estado === 'En Producción').length;
  }

  get pedidosEntregados(): number {
    return this.pedidos.filter(p => p.estado === 'Entregado').length;
  }

  get pedidosAtrasados(): PedidoListado[] {
    const hoy = new Date();
    return this.pedidos
      .filter(p => p.fecha_entrega && p.estado !== 'Entregado')
      .filter(p => new Date(p.fecha_entrega) < hoy);
  }

  get pedidosSinFecha(): PedidoListado[] {
    return this.pedidos.filter(p => !p.fecha_entrega && p.estado !== 'Entregado');
  }

  get totalPedidos(): number {
    return this.pedidos.length;
  }
}
