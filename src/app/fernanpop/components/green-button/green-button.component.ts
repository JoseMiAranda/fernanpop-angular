import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-product-button',
  standalone: true,
  imports: [],
  templateUrl: './green-button.component.html',
  styleUrl: './green-button.component.css'
})
export class GreenButtonComponent {
  @Input() title!: string; 
  @Input() isDisabled = false;
  @Input() submit = false;
  @Output() action = new EventEmitter<void>();

  onClick() {
    this.action.emit();
  }
}
