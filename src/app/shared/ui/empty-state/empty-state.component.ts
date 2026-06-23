import { Component, Input } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { TextComponent } from '../typography/text.component';
import { SectionHeadingComponent } from '../typography/section-heading.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CardComponent, TextComponent, SectionHeadingComponent],
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon?: string;
}
