import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MessageNotificationService } from '../../../services/message-notification.service';
import { MessageNotificationToast } from '../../../interfaces/message-notification.interface';

@Component({
  selector: 'app-message-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-notifications.component.html',
})
export class MessageNotificationsComponent {
  public toasts = this.messageNotificationService.toasts;

  constructor(private readonly messageNotificationService: MessageNotificationService) {}

  dismiss(toastId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.messageNotificationService.dismiss(toastId);
  }

  openConversation(toast: MessageNotificationToast): void {
    this.messageNotificationService.openConversation(toast);
  }
}
