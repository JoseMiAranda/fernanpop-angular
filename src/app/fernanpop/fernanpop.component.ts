import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearcherComponent } from '../shared/searcher/searcher.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-fernanpop',
  standalone: true,
  imports: [RouterModule, SearcherComponent, FooterComponent],
  templateUrl: './fernanpop.component.html',
})
export class FernanpopComponent {

}
