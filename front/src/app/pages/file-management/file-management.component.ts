import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileListComponent } from '../../components/file-list/file-list.component';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';

@Component({
  selector: 'app-file-management',
  standalone: true,
  imports: [CommonModule, FormsModule, FileListComponent, FileUploadComponent],
  template: `
    <div class="file-management-container">
      <header class="page-header">
        <h1>Управление файлами</h1>
        <div class="storage-info">
          <div class="storage-bar">
            <div class="used-storage" [style.width.%]="getStoragePercentage()"></div>
          </div>
          <p>Использовано {{usedStorage}} из {{totalStorage}} ГБ</p>
        </div>
      </header>

      <section class="upload-section">
        <h2>Загрузить новые файлы</h2>
        <app-file-upload></app-file-upload>
      </section>

      <section class="files-section">
        <h2>Ваши файлы</h2>
        <div class="filters">
          <select [(ngModel)]="currentFilter" (change)="applyFilter()">
            <option value="all">Все файлы</option>
            <option value="images">Изображения</option>
            <option value="documents">Документы</option>
            <option value="other">Другое</option>
          </select>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (input)="applySearch()"
            placeholder="Поиск файлов...">
        </div>
        <app-file-list></app-file-list>
      </section>
    </div>
  `,
  styles: [`
    .file-management-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .storage-info {
      margin-top: 1rem;
    }

    .storage-bar {
      height: 4px;
      background-color: #eee;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .used-storage {
      height: 100%;
      background-color: #007bff;
      transition: width 0.3s ease;
    }

    .upload-section {
      margin-bottom: 2rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    select, input {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    input {
      flex: 1;
    }
  `]
})
export class FileManagementComponent {
  currentFilter: string = 'all';
  searchQuery: string = '';
  usedStorage: number = 2.5; // В ГБ
  totalStorage: number = 10; // В ГБ

  getStoragePercentage(): number {
    return (this.usedStorage / this.totalStorage) * 100;
  }

  applyFilter() {
    // Здесь будет логика фильтрации файлов
    console.log('Применен фильтр:', this.currentFilter);
  }

  applySearch() {
    // Здесь будет логика поиска файлов
    console.log('Поисковый запрос:', this.searchQuery);
  }
} 