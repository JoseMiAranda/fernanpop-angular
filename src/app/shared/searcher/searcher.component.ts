import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { interval } from 'rxjs';

@Component({
  selector: 'app-searcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './searcher.component.html',
  styleUrl: './searcher.component.css'
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


  constructor(private router: Router) {
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

  onSubmit() {
    this.router.navigate(['/fernanpop/products'], {
      queryParams: {
        q: this.text
      }
    });
  }
}
