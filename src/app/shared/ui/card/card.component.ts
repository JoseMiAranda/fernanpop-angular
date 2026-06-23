import { Component, Input } from '@angular/core';

export type CardVariant = 'elevated' | 'filled' | 'interactive' | 'empty';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
})
export class CardComponent {
  @Input() variant: CardVariant = 'elevated';
  @Input() padding: CardPadding = 'md';

  private readonly variantClasses: Record<CardVariant, string> = {
    elevated:
      'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm',
    filled:
      'rounded-xl border border-outline-variant bg-surface-container-low',
    interactive:
      'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-colors hover:border-primary hover:bg-surface-container-low',
    empty:
      'rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-16 text-center shadow-sm',
  };

  private readonly paddingClasses: Record<CardPadding, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-stack-lg',
  };

  get classes(): string {
    const padding =
      this.variant === 'empty' ? '' : this.paddingClasses[this.padding];
    return `${this.variantClasses[this.variant]} ${padding}`.trim();
  }
}
