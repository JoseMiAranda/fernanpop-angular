import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { MessageNotificationsComponent } from '../shared/ui/message-notifications/message-notifications.component';

@Component({
  selector: 'app-fernanpop',
  standalone: true,
  imports: [RouterModule, NavbarComponent, FooterComponent, MessageNotificationsComponent],
  templateUrl: './fernanpop.component.html',
})
export class FernanpopComponent {

}
