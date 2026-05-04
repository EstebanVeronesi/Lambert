import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterService, RegisterRequest } from '../../../services/auth/register.service';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, BreadcrumbComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register implements OnInit {
  registerForm: FormGroup;
  isRegistered = signal(false);
  cargando = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService
  ) {
    // inicializamos el form con todos los campos
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      dni: [
        '',
        [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.minLength(7),
        Validators.maxLength(8)
      ]],
      rol: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/
          ),
        ],
      ]
    });
  }

  ngOnInit(): void {
    this.registerService.currentUserRegisterService.subscribe((registered) => {
      this.isRegistered.set(registered);
    });
  }

  // Getters para acceder a los form controls desde el template
  get nombre() { return this.registerForm.get('nombre'); }

  get id() { return this.registerForm.get('dni'); }

  get rol() { return this.registerForm.get('rol'); }

  get email() { return this.registerForm.get('email'); }

  get password() { return this.registerForm.get('password'); }


  register() {
    if (this.registerForm.valid) {
      this.cargando = true;
      const data: RegisterRequest = this.registerForm.value as RegisterRequest;

      this.registerService.register(data).subscribe({
        next: () => {
          alert('Registro exitoso. Ahora puedes iniciar sesión.');
          this.registerForm.reset();
          this.cargando = false;
          this.error = null;
        },
        error: (err) => {
          console.error('Error en registro:', err);
          this.error = err.error?.error || 'Error al registrar usuario.';
          this.cargando = false;
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
      this.error = 'Formulario inválido. Revisa los campos.';
    }
  }
}