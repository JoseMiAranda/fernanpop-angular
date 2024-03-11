import { CommonModule } from '@angular/common';
import { Component, HostBinding, signal } from '@angular/core';
import { interval } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { EllipsisPipe } from '../../fernanpop/pipes/ellipsis.pipe';
import { TitleComponent } from '../title/title.component';

@Component({
  selector: 'app-searcher',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterLink, SplitButtonModule, EllipsisPipe, TitleComponent],
  templateUrl: './searcher.component.html',
  styles: ``
})
export class SearcherComponent {
  private cont = -1;
  private products: string[] = ['nintendo', 'polystation', 'odoo premium', 'un café', 'como programar en Angular', 'una mazana', 'peluche Flutter Dash'];
  darkMode = signal<boolean>(JSON.parse(localStorage.getItem('dark_mode') ?? 'false'));
  animate = signal<boolean>(true);
  buy = 'Busca';
  product = signal<string>('un café');
  messageActivate = signal<boolean>(true);
  text = '';
  user = this.authService.currentUser;
  items: MenuItem[];


  constructor(private router: Router, private authService: AuthService) {
    this.items = [
      {
        label: 'Productos',
        icon: "pi pi-box",
        command: () => {
          router.navigate(['fernanpop/user/products'])
        }
      },
      {
        label: 'Transacciones',
        icon: "pi pi-truck",
        command: () => {
          router.navigate(['fernanpop/user/transactions'])
        }
      },
      {
        label: 'Cerrar sesión',
        icon: "pi pi-sign-out",
        command: () => {
          authService.logout();
          router.navigate(['fernanpop']);
        }
      }
    ]
    interval(4000).subscribe(() => this.animate.set(!this.animate()));

    interval(8000).subscribe(() => {
      this.cont = (this.cont + 1) % this.products.length;
      this.product.set(this.products[this.cont]);
    });
  }

  changeMessage() {
    if (this.text === '') {
      this.messageActivate.set(!this.messageActivate());
    }
  }

  onInput(value: string) {
    this.text = value;
  }

  onSubmit(value: string) {
    this.router.navigate(['/fernanpop/products'], {
      queryParams: {
        q: this.text
      }
    });
  }


}
