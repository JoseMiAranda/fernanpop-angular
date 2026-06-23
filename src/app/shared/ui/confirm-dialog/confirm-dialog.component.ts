import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { CardComponent } from '../card/card.component';

export type ConfirmDialogVariant = 'teal' | 'success' | 'danger';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent],
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

  get acceptButtonVariant(): 'primary' | 'destructive' {
    return this.acceptVariant === 'danger' ? 'destructive' : 'primary';
  }

  get acceptDestructiveStyle(): 'text' | 'border' {
    return this.acceptVariant === 'danger' ? 'border' : 'text';
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
