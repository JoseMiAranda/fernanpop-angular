import { Component, Input } from '@angular/core';

export type PageTitleSize = 'hero' | 'compact';

@Component({
  selector: 'app-page-title',
  standalone: true,
  templateUrl: './page-title.component.html',
})
export class PageTitleComponent {
  @Input() size: PageTitleSize = 'hero';
  @Input() withMargin = true;

  private readonly sizeClasses: Record<PageTitleSize, string> = {
    hero: 'font-headline text-3xl font-bold text-on-surface md:text-4xl lg:text-5xl',
    compact: 'font-headline text-2xl font-bold text-on-surface',
  };

  get classes(): string {
    const margin = this.withMargin ? 'mb-stack-lg' : '';
    return `${margin} ${this.sizeClasses[this.size]}`.trim();
  }
}
