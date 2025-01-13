import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-container" 
         (dragover)="onDragOver($event)" 
         (dragleave)="onDragLeave($event)"
         (drop)="onDrop($event)"
         [class.drag-over]="isDragOver">
      <input type="file" 
             #fileInput
             multiple
             (change)="onFileSelected($event)"
             style="display: none">
      
      <div class="upload-content">
        <button (click)="fileInput.click()">Выбрать файлы</button>
        <p>или перетащите файлы сюда</p>
      </div>

      <div class="upload-progress" *ngIf="isUploading">
        <div class="progress-bar">
          <div class="progress" [style.width.%]="uploadProgress"></div>
        </div>
        <p>Загрузка: {{uploadProgress}}%</p>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
    }
    .drag-over {
      border-color: #007bff;
      background-color: rgba(0,123,255,0.1);
    }
    .upload-content {
      margin-bottom: 1rem;
    }
    button {
      padding: 0.75rem 1.5rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 1rem;
    }
    .progress-bar {
      width: 100%;
      height: 4px;
      background-color: #eee;
      border-radius: 2px;
      overflow: hidden;
    }
    .progress {
      height: 100%;
      background-color: #007bff;
      transition: width 0.3s ease;
    }
  `]
})
export class FileUploadComponent {
  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;

  constructor(private fileService: FileService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.uploadFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadFiles(Array.from(input.files));
    }
  }

  async uploadFiles(files: File[]) {
    this.isUploading = true;
    this.uploadProgress = 0;

    try {
      // Имитация прогресса загрузки
      const interval = setInterval(() => {
        this.uploadProgress += 10;
        if (this.uploadProgress >= 100) {
          clearInterval(interval);
        }
      }, 200);

      await this.fileService.uploadFiles(files);
      
      clearInterval(interval);
      this.uploadProgress = 100;
      setTimeout(() => {
        this.isUploading = false;
        this.uploadProgress = 0;
      }, 500);
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
      this.isUploading = false;
      this.uploadProgress = 0;
    }
  }
} 