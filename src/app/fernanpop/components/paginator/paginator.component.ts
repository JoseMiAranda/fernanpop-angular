import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.component.html',
})
export class PaginatorComponent {
  @Input() page = 1;
  @Input() limit = 10;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  get visiblePages(): number[] {
    const size = 5;
    let start = Math.max(1, this.page - Math.floor(size / 2));
    let end = Math.min(this.totalPages, start + size - 1);
    start = Math.max(1, end - size + 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) {
      return;
    }

    this.pageChange.emit(page);
  }
}
