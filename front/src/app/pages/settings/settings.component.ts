import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="settings-container">
      <h1>Настройки профиля</h1>

      <div class="settings-section">
        <h2>Личные данные</h2>
        <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
          <div class="form-group">
            <label for="name">Имя</label>
            <input type="text" id="name" formControlName="name">
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" formControlName="email">
          </div>

          <button type="submit" [disabled]="profileForm.invalid || !profileForm.dirty">
            Сохранить изменения
          </button>
        </form>
      </div>

      <div class="settings-section">
        <h2>Изменить пароль</h2>
        <form [formGroup]="passwordForm" (ngSubmit)="updatePassword()">
          <div class="form-group">
            <label for="currentPassword">Текущий пароль</label>
            <input type="password" id="currentPassword" formControlName="currentPassword">
          </div>

          <div class="form-group">
            <label for="newPassword">Новый пароль</label>
            <input type="password" id="newPassword" formControlName="newPassword">
          </div>

          <div class="form-group">
            <label for="confirmPassword">Подтвердите пароль</label>
            <input type="password" id="confirmPassword" formControlName="confirmPassword">
          </div>

          <button type="submit" [disabled]="passwordForm.invalid || !passwordForm.dirty">
            Изменить пароль
          </button>
        </form>
      </div>

      <div class="settings-section">
        <h2>Настройки уведомлений</h2>
        <form [formGroup]="notificationForm" (ngSubmit)="updateNotificationSettings()">
          <div class="form-group checkbox">
            <input type="checkbox" id="emailNotifications" formControlName="emailNotifications">
            <label for="emailNotifications">Получать уведомления по email</label>
          </div>

          <div class="form-group checkbox">
            <input type="checkbox" id="pushNotifications" formControlName="pushNotifications">
            <label for="pushNotifications">Включить push-уведомления</label>
          </div>

          <button type="submit" [disabled]="!notificationForm.dirty">
            Сохранить настройки
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .settings-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h1 {
      margin-bottom: 2rem;
      color: #333;
    }

    h2 {
      color: #555;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #666;
    }

    input[type="text"],
    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox input {
      width: auto;
    }

    .checkbox label {
      margin: 0;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    button:hover:not(:disabled) {
      background-color: #0056b3;
    }
  `]
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  notificationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      pushNotifications: [false]
    });
  }

  ngOnInit() {
    // Загрузка текущих данных пользователя
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  updateProfile() {
    if (this.profileForm.valid) {
      // Здесь будет реальное обновление профиля через API
      this.notificationService.success('Профиль успешно обновлен');
    }
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      // Здесь будет реальное обновление пароля через API
      this.notificationService.success('Пароль успешно изменен');
      this.passwordForm.reset();
    }
  }

  updateNotificationSettings() {
    if (this.notificationForm.dirty) {
      // Здесь будет реальное обновление настроек через API
      this.notificationService.success('Настройки уведомлений обновлены');
    }
  }
} 