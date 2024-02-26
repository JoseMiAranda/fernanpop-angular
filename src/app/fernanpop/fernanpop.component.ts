import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearcherComponent } from '../shared/searcher/searcher.component';

@Component({
  selector: 'app-fernanpop',
  standalone: true,
  imports: [RouterModule, SearcherComponent],
  templateUrl: './fernanpop.component.html',
})
export class FernanpopComponent {

}
