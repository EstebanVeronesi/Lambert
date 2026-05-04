import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/auth/login.service';
import { LoginRequest } from '../../services/auth/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginForm: FormGroup;
  isLoggedIn = signal(false);
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loginService: LoginService
  ) {
    // inicializamos el form en el constructor
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.loginService.currentUserLogInService.subscribe((loggedIn) => {
      this.isLoggedIn.set(loggedIn);
    });

    this.loginService.isLoggedIn().subscribe({
    next: () => this.isLoggedIn.set(true),
    error: () => this.isLoggedIn.set(false),
  });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login() {
    if (this.loginForm.valid) {
      const credentials: LoginRequest = this.loginForm.value as LoginRequest;
      this.loginService.login(credentials).subscribe({
        next: () => {
          this.router.navigateByUrl('/dashboard');
          this.loginForm.reset();
        },
        error: (err) => {
          console.error('Error en login:', err);
          this.errorMessage = 'Credenciales incorrectas. Intentá de nuevo.';
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  logout() {
    this.loginService.logout().subscribe({
      next: () => {
      this.router.navigateByUrl('/iniciar-sesion');
    },
    error: (err) => {
      console.error('Error en logout:', err);
      alert('No se pudo cerrar sesión. Intenta de nuevo.');
    }
  });
  }
}