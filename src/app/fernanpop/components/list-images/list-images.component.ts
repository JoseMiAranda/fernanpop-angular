import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RedButtonComponent } from '../red-button/red-button.component';

@Component({
  selector: 'app-list-images',
  standalone: true,
  imports: [],
  templateUrl: './list-images.component.html',
  styleUrl: './list-images.component.css'
})
export class ListImagesComponent {
  @Input() images: string[] = [];
  @Output() deleteImage = new EventEmitter<any>();

  onClick(image: string) {
    this.deleteImage.emit(image);
  }
}
