import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { AuthGuard } from './auth/guards/auth.guard';
import { AdminGuard } from './auth/guards/admin.guard';
import { Dashboard } from './pages/dashboard/dashboard';
import { FormularioComponent } from './pages/formulario/formulario';
import { MisPedidosComponent } from './pages/mis-pedidos/mis-pedidos';
import { ExportarPedidosComponent } from './pages/mis-pedidos/exportar-pedidos/exportar-pedidos.component';
import { PedidoDetalleComponent } from './pages/mis-pedidos/detalle-pedidos/detalle-pedidos';
import { ImprimirPedidoComponent } from './pages/mis-pedidos/imprimir-pedido/imprimir-pedido.component';
import { AltaCamionComponent } from './pages/camiones/alta-camiones/alta-camiones';
import { CamionesComponent } from './pages/camiones/camiones';
import { CamionDetalleComponent } from './pages/camiones/detalle-camiones/detalle-camiones';
import { Register } from './pages/usuarios/register/register';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { AltaClienteComponent } from './pages/clientes/alta-clientes/alta-clientes';
import { ClientesComponent } from './pages/clientes/clientes';

// Aca va cada pagina
export const routes: Routes = [
  { path: '', redirectTo: '/iniciar-sesion', pathMatch: 'full' },
  { path: 'iniciar-sesion', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'formulario', component: FormularioComponent, canActivate: [AuthGuard] },
  { path: 'mis-pedidos', component: MisPedidosComponent, canActivate: [AuthGuard] },
  { path: 'mis-pedidos/exportar', component: ExportarPedidosComponent, canActivate: [AuthGuard] },
  { path: 'mis-pedidos/:id/imprimir', component: ImprimirPedidoComponent, canActivate: [AuthGuard] },
  { path: 'mis-pedidos/:id', component: PedidoDetalleComponent, canActivate: [AuthGuard] },
  { path: 'camiones/alta', component: AltaCamionComponent, canActivate: [AdminGuard] },
  { path: 'camiones', component: CamionesComponent, canActivate: [AuthGuard] },
  { path: 'camiones/:id', component: CamionDetalleComponent, canActivate: [AuthGuard] },
  { path: 'registrar-cuenta', component: Register, canActivate: [AdminGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [AdminGuard] },
  { path: 'clientes/alta', component: AltaClienteComponent, canActivate: [AuthGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/iniciar-sesion' }
];
