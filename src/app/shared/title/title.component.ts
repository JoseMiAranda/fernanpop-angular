import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-title',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './title.component.html',
  styles: ``
})
export class TitleComponent {
  title: string = 'Fernanpop'
}
