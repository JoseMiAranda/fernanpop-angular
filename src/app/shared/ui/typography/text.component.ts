import { Component, Input } from '@angular/core';

export type TextSize = 'base' | 'sm';

@Component({
  selector: 'app-text',
  standalone: true,
  templateUrl: './text.component.html',
})
export class TextComponent {
  @Input() size: TextSize = 'base';

  private readonly sizeClasses: Record<TextSize, string> = {
    base: 'font-body text-base text-on-surface-variant',
    sm: 'text-sm text-on-surface-variant',
  };

  get classes(): string {
    return this.sizeClasses[this.size];
  }
}
