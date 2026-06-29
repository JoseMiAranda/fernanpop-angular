import { Component, Input } from '@angular/core';

export type BadgeVariant = 'condition' | 'status' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.component.html',
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';

  private readonly variantClasses: Record<BadgeVariant, string> = {
    condition:
      'bg-primary-container/10 text-primary',
    status:
      'bg-primary-container text-white',
    neutral:
      'bg-surface-container-high text-on-surface-variant',
  };

  get classes(): string {
    const base =
      'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider';
    return [base, this.variantClasses[this.variant]].join(' ');
  }
}
