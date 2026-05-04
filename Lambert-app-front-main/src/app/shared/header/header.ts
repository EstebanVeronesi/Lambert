import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../services/auth/login.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isLoggedIn = signal(false);

  constructor(private loginService: LoginService, private router: Router) {
    this.loginService.isLoggedIn().subscribe();
    this.loginService.currentUserLogInService.subscribe((loggedIn) => {
      this.isLoggedIn.set(loggedIn);
    });
  }

  getUserInitials(): string {
    const name = this.loginService.getCurrentUser()?.nombre || 'U';
    return name.substring(0, 2).toUpperCase();
  }

  getUserName(): string {
    return this.loginService.getCurrentUser()?.nombre || 'Usuario';
  }

  getUserRole(): string {
    return this.loginService.getCurrentUser()?.rol || '';
  }

  logout(): void {
    this.loginService.logout().subscribe({
    next: () => {
      this.isLoggedIn.set(false);
      this.router.navigateByUrl('/iniciar-sesion');
    },
    error: (err) => {
      console.error('Error en logout:', err);
    }
  });
  }
}