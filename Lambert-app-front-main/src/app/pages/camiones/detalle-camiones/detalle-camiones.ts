import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CamionService, CamionListado, ConfiguracionCamion } from '../../../services/camion.service';
import { LoginService, User } from '../../../services/auth/login.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-camion-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent],
  templateUrl: './detalle-camiones.html',
  styleUrls: ['./detalle-camiones.scss'],
})
export class CamionDetalleComponent implements OnInit {
  camion: CamionListado | null = null;
  configuracion: ConfiguracionCamion | null = null;
  camionId: number | null = null;
  cargando = true;
  error = '';
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private camionService: CamionService,
    private http: HttpClient,
    private loginService: LoginService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.loginService.getCurrentUser();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.camionId = id;

      this.camionService.getCamion(id).subscribe({
        next: (data) => {
          this.camion = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error cargando camión', err);
          this.error = 'Error al cargar los datos del camión';
          this.cargando = false;
        },
      });

      this.camionService.getConfiguracion(id).subscribe({
        next: (data) => (this.configuracion = data),
        error: (err) => console.error('Error cargando configuración', err),
      });
    }
  }

  confirmarEliminar(): void {
    if (!this.camionId) return;
    if (confirm('¿Eliminar este camión? Esta acción no se puede deshacer.')) {
      this.http.delete(`http://localhost:3000/api/camiones/${this.camionId}`, {
        withCredentials: true
      }).subscribe({
        next: () => {
          this.toastService.success('Camión eliminado');
          this.router.navigate(['/camiones']);
        },
        error: () => this.toastService.error('Error al eliminar el camión')
      });
    }
  }
}