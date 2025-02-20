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
  @Output() onClick = new EventEmitter<string>();
}
