import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-container',
  standalone: true,
  templateUrl: './page-container.component.html',
})
export class PageContainerComponent {
  @Input() narrow = false;
}
