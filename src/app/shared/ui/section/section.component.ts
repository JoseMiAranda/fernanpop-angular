import { Component, Input } from '@angular/core';

export type SectionGap = 'sm' | 'md' | 'lg' | 'section';
export type SectionSpacing = 'none' | 'sm' | 'md' | 'lg' | 'section';

@Component({
  selector: 'app-section',
  standalone: true,
  templateUrl: './section.component.html',
})
export class SectionComponent {
  @Input() gap: SectionGap = 'md';
  @Input() spacing: SectionSpacing = 'none';

  private readonly gapClasses: Record<SectionGap, string> = {
    sm: 'gap-stack-sm',
    md: 'gap-stack-md',
    lg: 'gap-stack-lg',
    section: 'gap-section-gap',
  };

  private readonly spacingClasses: Record<SectionSpacing, string> = {
    none: '',
    sm: 'mb-stack-sm',
    md: 'mb-stack-md',
    lg: 'mb-stack-lg',
    section: 'mb-section-gap py-section-gap',
  };

  get classes(): string {
    return `flex flex-col ${this.gapClasses[this.gap]} ${this.spacingClasses[this.spacing]}`.trim();
  }
}
