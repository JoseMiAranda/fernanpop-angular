import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-red-button',
  standalone: true,
  imports: [],
  templateUrl: './red-button.component.html',
  styleUrl: './red-button.component.css'
})
export class RedButtonComponent {
  @Input() title!: string; 
  @Input() isDisabled = false;
  @Input() submit = false;
  @Output() action = new EventEmitter<void>();

  onClick() {
    this.action.emit();
  }
}
