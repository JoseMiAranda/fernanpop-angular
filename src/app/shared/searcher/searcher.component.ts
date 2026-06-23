import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Component({
  selector: 'app-searcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './searcher.component.html',
  styleUrl: './searcher.component.css'
})
export class SearcherComponent {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private suggestionIndex = 0;
  private readonly suggestions = [
    'Nintendo Switch',
    'bicicleta de montaña',
    'sofá modular',
    'iPhone 13',
    'zapatillas Nike',
    'mesa de escritorio',
    'chaqueta vintage',
    'auriculares Bluetooth',
  ];

  suggestion = signal(this.suggestions[0]);
  suggestionVisible = signal(true);
  showPlaceholder = signal(true);
  hasText = signal(false);
  text = '';

  constructor(private router: Router) {
    interval(6000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.suggestionVisible.set(false);
        setTimeout(() => {
          this.rotateSuggestion();
          this.suggestionVisible.set(true);
        }, 300);
      });
  }

  private rotateSuggestion() {
    this.suggestionIndex = (this.suggestionIndex + 1) % this.suggestions.length;
    this.suggestion.set(this.suggestions[this.suggestionIndex]);
  }

  onFocus() {
    if (!this.text) {
      this.showPlaceholder.set(false);
    }
  }

  onBlur() {
    if (!this.text) {
      this.showPlaceholder.set(true);
    }
  }

  onInput(value: string) {
    this.text = value;
    this.hasText.set(value.length > 0);
    this.showPlaceholder.set(value.length === 0);
  }

  clear() {
    this.text = '';
    this.hasText.set(false);
    this.showPlaceholder.set(true);
    this.searchInput.nativeElement.value = '';
    this.searchInput.nativeElement.focus();
  }

  onSubmit(event?: Event) {
    event?.preventDefault();

    const query = this.getQuery();
    const queryParams = query ? { q: query } : {};

    this.router.navigate(['/products'], { queryParams });
  }

  private getQuery(): string {
    const value = (this.searchInput?.nativeElement?.value ?? this.text).trim();
    return value || this.suggestion();
  }
}
