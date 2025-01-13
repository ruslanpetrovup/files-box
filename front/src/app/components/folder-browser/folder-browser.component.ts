import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService, FileItem } from '../../services/file.service';
import { NotificationService } from '../../services/notification.service';
import { FormsModule } from '@angular/forms';
import { FileListComponent } from '../file-list/file-list.component';
import { Folder } from '../../interfaces/folder.interface';

@Component({
  selector: 'app-folder-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, FileListComponent],
  template: `
    <div class="folder-browser">
      <!-- Путь к текущей папке -->
      <div class="folder-path">
        <button (click)="navigateToFolder(null)">Главная</button>
        <ng-container *ngFor="let folder of currentPath">
          <span class="separator">/</span>
          <button (click)="navigateToFolder(folder.id)">{{folder.name}}</button>
        </ng-container>
      </div>

      <!-- Создание новой папки -->
      <div class="create-folder">
        <input type="text" 
               [(ngModel)]="newFolderName" 
               placeholder="Имя новой папки">
        <button (click)="createFolder()" 
                [disabled]="!newFolderName">
          Создать папку
        </button>
      </div>

      <!-- Список папок -->
      <div class="folders-list">
        <div *ngFor="let folder of folders" 
             class="folder-item"
             (click)="navigateToFolder(folder.id)">
          <i class="fas fa-folder"></i>
          <span class="folder-name">{{folder.name}}</span>
          <span class="files-count">{{folder.filesCount}} файлов</span>
          <button class="delete-btn" 
                  (click)="deleteFolder(folder.id, $event)">
            Удалить
          </button>
        </div>
      </div>

      <!-- Список файлов в текущей папке -->
      <app-file-list 
        [files]="currentFiles"
        [currentFolderId]="currentFolderId"
        (moveFile)="moveFile($event.fileId, $event.folderId)">
      </app-file-list>
    </div>
  `,
  styles: [`
    .folder-browser {
      padding: 1rem;
    }

    .folder-path {
      margin-bottom: 1rem;
      padding: 0.5rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .folder-path button {
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
    }

    .separator {
      margin: 0 0.5rem;
      color: #666;
    }

    .create-folder {
      margin-bottom: 1rem;
      display: flex;
      gap: 1rem;
    }

    .create-folder input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .folders-list {
      margin-bottom: 2rem;
    }

    .folder-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border: 1px solid #eee;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      cursor: pointer;
    }

    .folder-item:hover {
      background-color: #f8f9fa;
    }

    .folder-name {
      margin-left: 1rem;
      flex: 1;
    }

    .files-count {
      color: #666;
      margin-right: 1rem;
    }

    .delete-btn {
      padding: 0.25rem 0.5rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .delete-btn:hover {
      background-color: #c82333;
    }
  `]
})
export class FolderBrowserComponent implements OnInit {
  folders: Folder[] = [];
  currentFiles: FileItem[] = [];
  currentFolderId: number | null = null;
  currentPath: Folder[] = [];
  newFolderName: string = '';
  @Output() fileSelect = new EventEmitter<FileItem>();

  constructor(
    private fileService: FileService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.fileService.folders$.subscribe(folders => {
      this.folders = folders.filter(f => f.parentId === this.currentFolderId);
    });

    this.updateCurrentFiles();
  }

  navigateToFolder(folderId: number | null) {
    this.currentFolderId = folderId;
    this.currentPath = this.fileService.getFolderPath(folderId);
    this.updateCurrentFiles();
  }

  async createFolder() {
    if (this.newFolderName.trim()) {
      try {
        await this.fileService.createFolder(this.newFolderName, this.currentFolderId);
        this.notificationService.success('Папка создана');
        this.newFolderName = '';
      } catch (error) {
        this.notificationService.error('Ошибка при создании папки');
      }
    }
  }

  async deleteFolder(folderId: number, event: Event) {
    event.stopPropagation();
    try {
      await this.fileService.deleteFolder(folderId);
      this.notificationService.success('Папка удалена');
    } catch (error) {
      this.notificationService.error('Ошибка при удалении папки');
    }
  }

  moveFile(fileId: number, folderId: number | null) {
    this.fileService.moveFile(fileId, folderId);
  }

  private updateCurrentFiles() {
    this.currentFiles = this.fileService.getFilesInFolder(this.currentFolderId);
  }

  onFileClick(file: FileItem) {
    this.fileSelect.emit(file);
  }
} 