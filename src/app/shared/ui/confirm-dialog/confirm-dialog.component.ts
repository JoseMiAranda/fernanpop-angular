import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ConfirmDialogVariant = 'teal' | 'success' | 'danger';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() header = '';
  @Input() message = '';
  @Input() acceptLabel = 'Aceptar';
  @Input() rejectLabel = 'Cancelar';
  @Input() acceptVariant: ConfirmDialogVariant = 'teal';

  @Output() accept = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();

  get acceptButtonClasses(): string {
    const base =
      'w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors sm:w-auto';

    switch (this.acceptVariant) {
      case 'danger':
        return `${base} bg-red-700 hover:bg-red-600`;
      case 'success':
        return `${base} bg-green-700 hover:bg-green-600`;
      default:
        return `${base} bg-teal-700 hover:bg-teal-600`;
    }
  }

  onAccept(): void {
    this.accept.emit();
  }

  onReject(): void {
    this.reject.emit();
  }

  onBackdropClick(): void {
    this.onReject();
  }
}
