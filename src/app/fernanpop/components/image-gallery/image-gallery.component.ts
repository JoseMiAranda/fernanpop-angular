import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [],
  templateUrl: './image-gallery.component.html',
})
export class ImageGalleryComponent {
  @Input() images: string[] = [];

  selectedIndex = signal(0);

  selectImage(index: number): void {
    this.selectedIndex.set(index);
  }

  previous(): void {
    const last = this.images.length - 1;
    this.selectedIndex.update((i) => (i === 0 ? last : i - 1));
  }

  next(): void {
    const last = this.images.length - 1;
    this.selectedIndex.update((i) => (i === last ? 0 : i + 1));
  }
}
