import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rating-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rating-dialog.component.html',
})
export class RatingDialogComponent {
  @Input() visible = false;
  @Input() productTitle = '';

  @Output() submitRating = new EventEmitter<{ score: number; description?: string }>();
  @Output() skip = new EventEmitter<void>();

  public selectedScore = signal<number | null>(null);
  public description = signal('');

  public readonly scores = [1, 2, 3, 4, 5];

  selectScore(score: number): void {
    this.selectedScore.set(score);
  }

  onSubmit(): void {
    const score = this.selectedScore();
    if (score === null) {
      return;
    }

    const trimmedDescription = this.description().trim();
    this.submitRating.emit({
      score,
      description: trimmedDescription || undefined,
    });
    this.reset();
  }

  onSkip(): void {
    this.skip.emit();
    this.reset();
  }

  onBackdropClick(): void {
    this.onSkip();
  }

  private reset(): void {
    this.selectedScore.set(null);
    this.description.set('');
  }
}
