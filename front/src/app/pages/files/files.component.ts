import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderBrowserComponent } from '../../components/folder-browser/folder-browser.component';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { FilePreviewModalComponent } from '../../components/file-preview-modal/file-preview-modal.component';
import { FileService, FileItem } from '../../services/file.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [
    CommonModule, 
    FolderBrowserComponent, 
    FileUploadComponent,
    FilePreviewModalComponent
  ],
  template: `
    <div class="files-page">
      <header class="page-header">
        <h1>Мои файлы</h1>
        <div class="header-actions">
          <button (click)="showUploadDialog = true" class="upload-btn">
            <i class="fas fa-upload"></i> Загрузить файлы
          </button>
        </div>
      </header>

      <app-folder-browser
        (fileSelect)="openPreview($event)">
      </app-folder-browser>

      <!-- Модальное окно загрузки -->
      <div *ngIf="showUploadDialog" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Загрузка файлов</h2>
            <button class="close-btn" (click)="showUploadDialog = false">×</button>
          </div>
          <app-file-upload
            (uploadComplete)="onUploadComplete()">
          </app-file-upload>
        </div>
      </div>

      <!-- Модальное окно предпросмотра -->
      <app-file-preview-modal
        *ngIf="selectedFile"
        [file]="selectedFile"
        (close)="selectedFile = null"
        (delete)="deleteFile()">
      </app-file-preview-modal>
    </div>
  `,
  styles: [`
    .files-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .upload-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .upload-btn:hover {
      background-color: #0056b3;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: white;
      border-radius: 8px;
      padding: 2rem;
      width: 90%;
      max-width: 600px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }

    .close-btn:hover {
      color: #333;
    }
  `]
})
export class FilesComponent {
  showUploadDialog = false;
  selectedFile: FileItem | null = null;

  constructor(
    private fileService: FileService,
    private notificationService: NotificationService
  ) {}

  openPreview(file: FileItem) {
    this.selectedFile = file;
  }

  async deleteFile() {
    if (this.selectedFile) {
      try {
        await this.fileService.deleteFiles([this.selectedFile.id]);
        this.notificationService.success('Файл успешно удален');
        this.selectedFile = null;
      } catch (error) {
        this.notificationService.error('Ошибка при удалении файла');
      }
    }
  }

  onUploadComplete() {
    this.showUploadDialog = false;
    this.notificationService.success('Файлы успешно загружены');
  }
} 