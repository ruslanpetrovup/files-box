import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FileService, FileItem } from '../../services/file.service';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FileUploadComponent],
  template: `
    <div class="home-container">
      <header class="welcome-section">
        <h1>Добро пожаловать, {{userName}}!</h1>
        <p>Управляйте вашими файлами легко и безопасно</p>
      </header>

      <section class="quick-upload">
        <h2>Быстрая загрузка</h2>
        <app-file-upload></app-file-upload>
      </section>

      <section class="recent-files">
        <div class="section-header">
          <h2>Недавние файлы</h2>
          <a routerLink="/files" class="view-all">Посмотреть все файлы</a>
        </div>

        <div class="files-grid">
          <div *ngFor="let file of recentFiles" class="file-card">
            <div class="file-icon">
              <i [class]="getFileIcon(file.type)"></i>
            </div>
            <div class="file-info">
              <h3>{{file.name}}</h3>
              <p>{{formatFileSize(file.size)}}</p>
              <p class="date">{{file.uploadDate | date:'dd.MM.yyyy'}}</p>
            </div>
            <div class="file-actions">
              <button (click)="downloadFile(file)">Скачать</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .quick-upload {
      margin-bottom: 3rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .view-all {
      color: #007bff;
      text-decoration: none;
    }

    .files-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .file-card {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .file-icon {
      font-size: 2rem;
      color: #007bff;
      text-align: center;
    }

    .file-info {
      text-align: center;
    }

    .file-info h3 {
      margin: 0;
      font-size: 1rem;
      word-break: break-all;
    }

    .file-info p {
      margin: 0.25rem 0;
      color: #666;
    }

    .file-actions {
      margin-top: auto;
      text-align: center;
    }

    button {
      padding: 0.5rem 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background-color: #0056b3;
    }
  `]
})
export class HomeComponent implements OnInit {
  recentFiles: FileItem[] = [];
  userName: string = '';

  constructor(
    private fileService: FileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRecentFiles();
    this.authService.currentUser$.subscribe(user => {
      this.userName = user?.name || 'Гость';
    });
  }

  loadRecentFiles() {
    this.recentFiles = this.fileService.getRecentFiles(6);
  }

  getFileIcon(type: string): string {
    if (type.includes('image')) return 'far fa-image';
    if (type.includes('pdf')) return 'far fa-file-pdf';
    if (type.includes('document')) return 'far fa-file-word';
    return 'far fa-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadFile(file: FileItem) {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  }
} 