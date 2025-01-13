import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <h2>Регистрация</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Имя:</label>
          <input type="text" id="name" formControlName="name">
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" formControlName="email">
        </div>
        <div class="form-group">
          <label for="password">Пароль:</label>
          <input type="password" id="password" formControlName="password">
        </div>
        <div class="form-group">
          <label for="confirmPassword">Подтверждение пароля:</label>
          <input type="password" id="confirmPassword" formControlName="confirmPassword">
        </div>
        <button type="submit" [disabled]="registerForm.invalid">Зарегистрироваться</button>
      </form>
    </div>
  `,
  styles: [`
    .auth-container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    input {
      width: 100%;
      padding: 0.5rem;
      margin-top: 0.25rem;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background-color: #ccc;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      const { email, password, name } = this.registerForm.value;
      try {
        await this.authService.register(email, password, name);
        this.router.navigate(['/']);
      } catch (error) {
        console.error('Ошибка регистрации:', error);
      }
    }
  }
} 