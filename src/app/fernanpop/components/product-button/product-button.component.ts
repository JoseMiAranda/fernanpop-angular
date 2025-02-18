import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-product-button',
  standalone: true,
  imports: [],
  templateUrl: './product-button.component.html',
  styleUrl: './product-button.component.css'
})
export class ProductButtonComponent {
  @Input() title!: string; 
  @Input() isDisabled = false;
  @Output() action = new EventEmitter<void>();

  onClick() {
    this.action.emit();
  }
}
