import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/auth/user.service';
import { User, LoginService } from '../../services/auth/login.service';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbComponent, PaginationComponent],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosComponent implements OnInit {
  usuarios: User[] = [];
  filteredUsuarios: User[] = [];
  cargando = true;
  filtro = '';
  page = 1;
  pageSize = 10;
  currentUser: User | null = null;

  constructor(
    private userService: UserService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.loginService.getCurrentUser();
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.usuarios = data;
        this.filteredUsuarios = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar usuarios:', err);
        this.cargando = false;
      }
    });
  }

  filtrar(): void {
    const term = this.filtro.toLowerCase();
    this.filteredUsuarios = this.usuarios.filter(u =>
      u.nombre.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
    this.page = 1;
  }

  get paginatedItems(): User[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredUsuarios.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsuarios.length / this.pageSize);
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
  }

  confirmarEliminar(dni: string | number): void {
    const confirmado = confirm('¿Estás seguro de que querés eliminar este usuario?');
    if (!confirmado) return;

    this.userService.deleteUser(String(dni)).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => String(u.id) !== String(dni));
        this.filtrar();
      },
      error: (err: any) => {
        console.error('Error al eliminar usuario:', err);
        alert('Error al eliminar el usuario.');
      }
    });
  }
}