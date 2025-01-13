import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileItem } from '../../services/file.service';

@Component({
  selector: 'app-file-preview-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{file.name}}</h3>
          <button class="close-btn" (click)="close.emit()">×</button>
        </div>
        
        <div class="modal-body">
          <ng-container [ngSwitch]="getFileType()">
            <!-- Изображения -->
            <img *ngSwitchCase="'image'" [src]="file.url" alt="preview">
            
            <!-- PDF -->
            <iframe *ngSwitchCase="'pdf'" 
                    [src]="file.url" 
                    width="100%" 
                    height="500px">
            </iframe>
            
            <!-- Видео -->
            <video *ngSwitchCase="'video'" 
                   [src]="file.url" 
                   controls>
            </video>
            
            <!-- Аудио -->
            <audio *ngSwitchCase="'audio'" 
                   [src]="file.url" 
                   controls>
            </audio>
            
            <!-- Другие типы файлов -->
            <div *ngSwitchDefault class="file-info">
              <i class="far fa-file"></i>
              <p>Предпросмотр недоступен</p>
              <button (click)="downloadFile()">Скачать файл</button>
            </div>
          </ng-container>
        </div>
        
        <div class="modal-footer">
          <div class="file-details">
            <p>Размер: {{formatFileSize(file.size)}}</p>
            <p>Загружен: {{file.uploadDate | date:'dd.MM.yyyy HH:mm'}}</p>
          </div>
          <div class="actions">
            <button (click)="downloadFile()">Скачать</button>
            <button class="delete" (click)="deleteFile()">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: white;
      border-radius: 8px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 1rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-body {
      padding: 1rem;
      overflow: auto;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .modal-footer {
      padding: 1rem;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }

    img, video {
      max-width: 100%;
      max-height: 70vh;
    }

    .file-info {
      text-align: center;
      padding: 2rem;
    }

    .file-info i {
      font-size: 3rem;
      color: #666;
      margin-bottom: 1rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background-color: #007bff;
      color: white;
    }

    button.delete {
      background-color: #dc3545;
    }
  `]
})
export class FilePreviewModalComponent {
  @Input() file!: FileItem;
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  getFileType(): string {
    if (this.file.type.includes('image')) return 'image';
    if (this.file.type.includes('pdf')) return 'pdf';
    if (this.file.type.includes('video')) return 'video';
    if (this.file.type.includes('audio')) return 'audio';
    return 'other';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadFile() {
    const link = document.createElement('a');
    link.href = this.file.url;
    link.download = this.file.name;
    link.click();
  }

  deleteFile() {
    this.delete.emit();
  }
} 