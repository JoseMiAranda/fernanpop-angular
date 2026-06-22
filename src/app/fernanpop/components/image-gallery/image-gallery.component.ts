import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [],
  templateUrl: './image-gallery.component.html',
})
export class ImageGalleryComponent {
  @Input() images: string[] = [];
  @Input() set activeIndex(value: number) {
    this.selectedIndex.set(value);
  }
  @Output() selectedIndexChange = new EventEmitter<number>();

  selectedIndex = signal(0);

  selectImage(index: number): void {
    this.selectedIndex.set(index);
    this.selectedIndexChange.emit(index);
  }

  previous(): void {
    const last = this.images.length - 1;
    const next = this.selectedIndex() === 0 ? last : this.selectedIndex() - 1;
    this.selectImage(next);
  }

  next(): void {
    const last = this.images.length - 1;
    const next = this.selectedIndex() === last ? 0 : this.selectedIndex() + 1;
    this.selectImage(next);
  }
}
