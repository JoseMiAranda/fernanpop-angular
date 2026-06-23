import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'md' | 'lg';
export type DestructiveStyle = 'text' | 'border';

/**
 * Shared button with fixed variants: primary, secondary, tertiary, destructive.
 * Do not add new variants in page templates — extend this component instead.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() destructiveStyle: DestructiveStyle = 'text';
  @Input() routerLink?: string | string[];
  /** Button text. Required when using routerLink; optional otherwise (ng-content fallback). */
  @Input() label = '';
  @Output() action = new EventEmitter<void>();

  @HostBinding('class.block')
  get hostBlock(): boolean {
    return this.fullWidth;
  }

  @HostBinding('class.w-full')
  get hostFullWidth(): boolean {
    return this.fullWidth;
  }

  private readonly variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-primary text-white hover:bg-primary-container disabled:bg-gray-400',
    secondary:
      'border border-outline text-on-surface hover:bg-surface-container-high disabled:opacity-50',
    tertiary:
      'text-secondary hover:text-primary disabled:opacity-50',
    destructive: '',
  };

  private readonly destructiveStyleClasses: Record<DestructiveStyle, string> = {
    text: 'text-error hover:text-error/80 disabled:opacity-50',
    border:
      'border border-error-container/30 bg-error-container/10 text-error hover:bg-error-container/20 disabled:opacity-50',
  };

  private readonly sizeClasses: Record<ButtonSize, string> = {
    md: 'px-4 py-2 text-sm font-semibold',
    lg: 'px-8 py-4 text-sm font-semibold uppercase tracking-wider',
  };

  get classes(): string {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-lg transition-colors active:scale-95';
    const variant =
      this.variant === 'destructive'
        ? this.destructiveStyleClasses[this.destructiveStyle]
        : this.variantClasses[this.variant];
    const size = this.sizeClasses[this.size];
    const width = this.fullWidth ? 'w-full' : '';
    const shadow = this.variant === 'primary' ? 'shadow-sm' : '';
    const disabled =
      this.disabled ? 'cursor-not-allowed pointer-events-none' : '';

    return [base, variant, size, width, shadow, disabled].filter(Boolean).join(' ');
  }

  onClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    this.action.emit();
  }
}
