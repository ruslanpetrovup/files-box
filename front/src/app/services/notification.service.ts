import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new Subject<Notification>();
  private autoHideTime = 5000; // 5 секунд

  getNotifications() {
    return this.notifications$.asObservable();
  }

  show(message: string, type: Notification['type'] = 'info') {
    const notification: Notification = {
      message,
      type,
      id: Date.now()
    };
    
    this.notifications$.next(notification);
    
    // Автоматически скрываем уведомление
    setTimeout(() => {
      this.hide(notification.id);
    }, this.autoHideTime);
  }

  hide(id: number) {
    this.notifications$.next({ id } as Notification);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }
} 