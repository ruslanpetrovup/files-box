import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div *ngFor="let notification of notifications"
           class="notification"
           [class]="notification.type"
           [@fadeInOut]>
        <div class="notification-content">
          <span class="message">{{notification.message}}</span>
          <button class="close-btn" (click)="hideNotification(notification.id)">×</button>
        </div>
        <div class="progress-bar"></div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .notification {
      min-width: 300px;
      padding: 15px;
      border-radius: 4px;
      color: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      position: relative;
      overflow: hidden;
    }

    .notification-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0 5px;
    }

    .success {
      background-color: #28a745;
    }

    .error {
      background-color: #dc3545;
    }

    .info {
      background-color: #17a2b8;
    }

    .warning {
      background-color: #ffc107;
      color: #000;
    }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background-color: rgba(255,255,255,0.5);
      width: 100%;
      animation: progress 5s linear;
    }

    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.getNotifications().subscribe(notification => {
      if (!notification.message) {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
      } else {
        this.notifications.push(notification);
      }
    });
  }

  hideNotification(id: number) {
    this.notificationService.hide(id);
  }
} 