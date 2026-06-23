import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PageItem = number | 'ellipsis';

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

  get pageItems(): PageItem[] {
    const total = this.totalPages;
    const current = this.page;
    const windowPages = this.getWindowPages(current, total);

    const pages = new Set<number>([1, total, ...windowPages]);
    const sorted = [...pages].sort((a, b) => a - b);
    const items: PageItem[] = [];

    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        items.push('ellipsis');
      }
      items.push(sorted[i]);
    }

    return items;
  }

  private getWindowPages(current: number, total: number): number[] {
    let start: number;
    let end: number;

    if (current <= 2) {
      start = 1;
      end = Math.min(3, total);
    } else if (current === 3) {
      start = 1;
      end = Math.min(4, total);
    } else if (current >= total - 1) {
      start = Math.max(1, total - 2);
      end = total;
    } else if (current === total - 2) {
      start = Math.max(1, total - 3);
      end = total;
    } else {
      start = current - 1;
      end = current + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) {
      return;
    }

    this.pageChange.emit(page);
  }
}
