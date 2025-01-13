import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService, FileItem } from '../../services/file.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="file-list-container">
      <div class="file-list-header">
        <div class="select-all">
          <input type="checkbox" 
                 [checked]="areAllSelected" 
                 (change)="toggleSelectAll()">
        </div>
        <div class="header-name">Имя файла</div>
        <div class="header-size">Размер</div>
        <div class="header-date">Дата загрузки</div>
        <div class="header-actions">Действия</div>
      </div>

      <div class="file-list-body">
        <div *ngFor="let file of files" class="file-item">
          <div class="select">
            <input type="checkbox" 
                   [(ngModel)]="file.selected"
                   (change)="updateSelection()">
          </div>
          <div class="name">{{file.name}}</div>
          <div class="size">{{formatFileSize(file.size)}}</div>
          <div class="date">{{file.uploadDate | date:'dd.MM.yyyy HH:mm'}}</div>
          <div class="actions">
            <button (click)="downloadFile(file)">Скачать</button>
            <button (click)="deleteFile(file.id)" class="delete">Удалить</button>
          </div>
        </div>
      </div>

      <div class="file-list-footer" *ngIf="selectedFiles.length > 0">
        <button (click)="downloadSelected()">Скачать выбранные</button>
        <button (click)="deleteSelected()" class="delete">Удалить выбранные</button>
      </div>
    </div>
  `,
  styles: [`
    .file-list-container {
      padding: 1rem;
    }
    .file-list-header, .file-item {
      display: grid;
      grid-template-columns: 50px 2fr 1fr 1fr 1fr;
      padding: 0.5rem;
      align-items: center;
    }
    .file-list-header {
      font-weight: bold;
      background-color: #f5f5f5;
    }
    .file-item {
      border-bottom: 1px solid #eee;
    }
    .file-item:hover {
      background-color: #f9f9f9;
    }
    .actions button {
      margin-right: 0.5rem;
      padding: 0.25rem 0.5rem;
    }
    .delete {
      background-color: #dc3545;
      color: white;
    }
    .file-list-footer {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f5f5f5;
    }
  `]
})
export class FileListComponent implements OnInit {
  @Input() files: (FileItem & { selected?: boolean })[] = [];
  @Input() currentFolderId: number | null = null;
  @Output() moveFile = new EventEmitter<{ fileId: number, folderId: number | null }>();
  areAllSelected = false;

  constructor(private fileService: FileService) {}

  ngOnInit() {
    this.fileService.files$.subscribe(files => {
      this.files = files.map(f => ({ ...f, selected: false }));
    });
  }

  get selectedFiles() {
    return this.files.filter(f => f.selected);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  toggleSelectAll() {
    this.areAllSelected = !this.areAllSelected;
    this.files.forEach(file => file.selected = this.areAllSelected);
  }

  updateSelection() {
    this.areAllSelected = this.files.every(file => file.selected);
  }

  async deleteFile(id: number) {
    await this.fileService.deleteFiles([id]);
  }

  async deleteSelected() {
    const selectedIds = this.selectedFiles.map(f => f.id);
    await this.fileService.deleteFiles(selectedIds);
  }

  downloadFile(file: FileItem) {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  }

  downloadSelected() {
    this.selectedFiles.forEach(file => this.downloadFile(file));
  }

  onMoveFile(fileId: number) {
    this.moveFile.emit({ fileId, folderId: this.currentFolderId });
  }
} 