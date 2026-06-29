import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, SegmentedControlComponent, SegmentedOption } from '../../../../../shared/ui';
import { SearcherComponent } from '../../../../../shared/searcher/searcher.component';
import { Category } from '../../../../../interfaces/category.interface';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [ButtonComponent, SegmentedControlComponent, SearcherComponent],
  templateUrl: './hero-section.component.html',
})
export class HeroSectionComponent {
  @Input({ required: true }) heroImage = '';
  @Input({ required: true }) categories: Category[] = [];
  @Output() browseMarketplace = new EventEmitter<void>();
  @Output() browseCategory = new EventEmitter<string>();

  searchMode: 'buy' | 'sell' = 'buy';

  readonly modeOptions: SegmentedOption[] = [
    { value: 'buy', label: 'Comprar' },
    { value: 'sell', label: 'Vender' },
  ];

  constructor(private router: Router) {}

  onModeChange(value: string): void {
    this.searchMode = value as 'buy' | 'sell';
    if (this.searchMode === 'sell') {
      this.router.navigate(['/create-product']);
    }
  }

  onBrowseMarketplace(): void {
    this.browseMarketplace.emit();
  }

  onBrowseCategory(categoryId: string): void {
    this.browseCategory.emit(categoryId);
  }

  onSellClick(): void {
    this.router.navigate(['/create-product']);
  }
}
