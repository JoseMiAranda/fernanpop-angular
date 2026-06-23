import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-images',
  standalone: true,
  imports: [],
  templateUrl: './list-images.component.html',
  styleUrl: './list-images.component.css'
})
export class ListImagesComponent {
  @Input() images: string[] = [];
  @Input() selectedIndex = 0;
  @Output() deleteImage = new EventEmitter<string>();
  @Output() selectImage = new EventEmitter<number>();

  onSelect(index: number) {
    this.selectImage.emit(index);
  }

  onDelete(image: string, event: Event) {
    event.stopPropagation();
    this.deleteImage.emit(image);
  }
}
