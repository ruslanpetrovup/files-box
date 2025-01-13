import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface User {
  id: number;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  login(email: string, password: string): Promise<void> {
    // Здесь будет реальная логика авторизации через API
    return new Promise((resolve) => {
      const mockUser = { id: 1, email, name: 'Тестовый пользователь' };
      this.currentUserSubject.next(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      resolve();
    });
  }

  register(email: string, password: string, name: string): Promise<void> {
    // Здесь будет реальная логика регистрации через API
    return new Promise((resolve) => {
      const mockUser = { id: 1, email, name };
      this.currentUserSubject.next(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      resolve();
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('user');
  }
} 