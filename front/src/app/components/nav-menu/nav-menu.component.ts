import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="nav-container">
      <div class="nav-brand">
        <a routerLink="/">FileManager</a>
      </div>
      
      <div class="nav-links">
        <a routerLink="/" 
           routerLinkActive="active" 
           [routerLinkActiveOptions]="{exact: true}">Главная</a>
        <a routerLink="/files" 
           routerLinkActive="active">Файлы</a>
        <a routerLink="/file-management" 
           routerLinkActive="active">Управление</a>
      </div>

      <div class="nav-user">
        <a routerLink="/settings" 
           routerLinkActive="active" 
           class="settings-link">
          <i class="fas fa-cog"></i>
        </a>
        <span class="user-name">{{userName}}</span>
        <button (click)="logout()" class="logout-btn">Выйти</button>
      </div>
    </nav>
  `,
  styles: [`
    .nav-container {
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-brand a {
      font-size: 1.5rem;
      font-weight: bold;
      color: #007bff;
      text-decoration: none;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
    }

    .nav-links a {
      color: #333;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .nav-links a:hover {
      background-color: #f5f5f5;
    }

    .nav-links a.active {
      color: #007bff;
      background-color: #e6f2ff;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name {
      color: #666;
    }

    .logout-btn {
      padding: 0.5rem 1rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .logout-btn:hover {
      background-color: #c82333;
    }

    .settings-link {
      color: #666;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .settings-link:hover {
      background-color: #f5f5f5;
    }

    .settings-link.active {
      color: #007bff;
    }
  `]
})
export class NavMenuComponent {
  userName: string = '';

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.userName = user?.name || '';
    });
  }

  logout() {
    this.authService.logout();
  }
} 