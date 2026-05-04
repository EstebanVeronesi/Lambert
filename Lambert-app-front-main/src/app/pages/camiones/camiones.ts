import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CamionService, CamionListado } from '../../services/camion.service';
import { LoginService, User } from '../../services/auth/login.service';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-camiones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbComponent, PaginationComponent],
  templateUrl: './camiones.html',
  styleUrls: ['./camiones.scss'],
})
export class CamionesComponent implements OnInit {
  camiones: CamionListado[] = [];
  filteredCamiones: CamionListado[] = [];
  cargando = true;
  error = '';
  currentUser: User | null = null;
  filtro = '';
  page = 1;
  pageSize = 10;

  constructor(private camionService: CamionService, private loginService: LoginService) {}

  ngOnInit(): void {
    this.currentUser = this.loginService.getCurrentUser();
    this.camionService.getCamiones().subscribe({
      next: (data) => {
        this.camiones = data;
        this.filteredCamiones = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al obtener camiones';
        console.error(err);
        this.cargando = false;
      },
    });
  }

  filtrar(): void {
    const term = this.filtro.toLowerCase();
    this.filteredCamiones = this.camiones.filter(c =>
      c.marca_camion.toLowerCase().includes(term) ||
      c.modelo_camion.toLowerCase().includes(term)
    );
    this.page = 1;
  }

  get paginatedItems(): CamionListado[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredCamiones.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCamiones.length / this.pageSize);
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
  }

}