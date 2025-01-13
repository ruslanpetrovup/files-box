import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Folder } from '../interfaces/folder.interface';

export interface FileItem {
  id: number;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  url: string;
  folderId: number | null;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private filesSubject = new BehaviorSubject<FileItem[]>([]);
  private foldersSubject = new BehaviorSubject<Folder[]>([]);
  
  get files$(): Observable<FileItem[]> {
    return this.filesSubject.asObservable();
  }

  get folders$(): Observable<Folder[]> {
    return this.foldersSubject.asObservable();
  }

  createFolder(name: string, parentId: number | null = null): Promise<void> {
    return new Promise((resolve) => {
      const newFolder: Folder = {
        id: Date.now(),
        name,
        parentId,
        createdAt: new Date(),
        filesCount: 0
      };
      
      this.foldersSubject.next([...this.foldersSubject.value, newFolder]);
      resolve();
    });
  }

  moveFile(fileId: number, folderId: number | null): Promise<void> {
    return new Promise((resolve) => {
      const updatedFiles = this.filesSubject.value.map(file => 
        file.id === fileId ? { ...file, folderId } : file
      );
      this.filesSubject.next(updatedFiles);
      this.updateFolderCount();
      resolve();
    });
  }

  deleteFolder(folderId: number): Promise<void> {
    return new Promise((resolve) => {
      // Удаляем папку
      const updatedFolders = this.foldersSubject.value.filter(f => f.id !== folderId);
      this.foldersSubject.next(updatedFolders);

      // Перемещаем файлы из удаленной папки в корневую директорию
      const updatedFiles = this.filesSubject.value.map(file => 
        file.folderId === folderId ? { ...file, folderId: null } : file
      );
      this.filesSubject.next(updatedFiles);
      resolve();
    });
  }

  private updateFolderCount(): void {
    const files = this.filesSubject.value;
    const updatedFolders = this.foldersSubject.value.map(folder => ({
      ...folder,
      filesCount: files.filter(f => f.folderId === folder.id).length
    }));
    this.foldersSubject.next(updatedFolders);
  }

  getFilesInFolder(folderId: number | null): FileItem[] {
    return this.filesSubject.value.filter(f => f.folderId === folderId);
  }

  getFolderPath(folderId: number | null): Folder[] {
    const path: Folder[] = [];
    let currentFolder = this.foldersSubject.value.find(f => f.id === folderId);
    
    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = this.foldersSubject.value.find(f => f.id === currentFolder?.parentId);
    }
    
    return path;
  }

  getRecentFiles(count: number): FileItem[] {
    // Возвращает последние `count` файлов
    return this.filesSubject.value.slice(0, count);
  }

  async uploadFiles(files: File[]): Promise<void> {
    const newFiles: FileItem[] = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      url: URL.createObjectURL(file),
      folderId: null
    }));

    this.filesSubject.next([...this.filesSubject.value, ...newFiles]);
  }

  async deleteFiles(fileIds: number[]): Promise<void> {
    const updatedFiles = this.filesSubject.value.filter(file => !fileIds.includes(file.id));
    this.filesSubject.next(updatedFiles);
  }
} 