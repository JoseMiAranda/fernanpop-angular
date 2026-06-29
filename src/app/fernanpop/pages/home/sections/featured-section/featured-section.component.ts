import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../../../interfaces/product.interface';
import { ListProductsComponent } from '../../../../components/list-products/list-products.component';
import { ButtonComponent, SectionHeadingComponent, TextComponent } from '../../../../../shared/ui';
import { State } from '../../../../../states/state.interface';

@Component({
  selector: 'app-featured-section',
  standalone: true,
  imports: [ListProductsComponent, ButtonComponent, SectionHeadingComponent, TextComponent],
  templateUrl: './featured-section.component.html',
})
export class FeaturedSectionComponent {
  @Input({ required: true }) productsState!: State;
  @Input({ required: true }) featuredProducts: Product[] = [];
  @Output() browseMarketplace = new EventEmitter<void>();

  onBrowseMarketplace(): void {
    this.browseMarketplace.emit();
  }
}
