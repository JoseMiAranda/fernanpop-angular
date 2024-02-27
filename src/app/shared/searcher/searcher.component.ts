import { CommonModule } from '@angular/common';
import { Component, HostBinding, signal } from '@angular/core';
import { interval } from 'rxjs';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-searcher',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './searcher.component.html',
  styles: ``
})
export class SearcherComponent {
  private cont = -1;
  private products: string[] = ['nintendo', 'polystation', 'odoo premium', 'un café'];
  title = 'auth-firebase';
  darkMode = signal<boolean>(JSON.parse(localStorage.getItem('dark_mode') ?? 'false'));
  animate = signal<boolean>(true);
  buy = 'Busca';
  product = signal<string>('un café');
  messageActivate = signal<boolean>(true);
  text = '';

  constructor() {
    interval(4000).subscribe(() => this.animate.set(!this.animate()));

    interval(8000).subscribe(() => {
      this.cont = (this.cont + 1) % this.products.length;
      this.product.set(this.products[this.cont]);
    });
  }

  @HostBinding('class.dark') get mode() {
    return this.darkMode();
  }

  changeTheme() {
    this.darkMode.set(!this.darkMode());
    localStorage.setItem('dark_mode', `${this.darkMode()}`);
  }

  changeMessage() {
    if (this.text === '') {
      this.messageActivate.set(!this.messageActivate());
    }
  }

  onInput(value: string) {
    this.text = value;
  }
}
