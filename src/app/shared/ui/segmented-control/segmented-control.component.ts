import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SegmentedOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-segmented-control',
  standalone: true,
  templateUrl: './segmented-control.component.html',
})
export class SegmentedControlComponent {
  @Input({ required: true }) options: SegmentedOption[] = [];
  @Input() value = '';
  @Input() ariaLabel = 'Selección';
  @Output() valueChange = new EventEmitter<string>();

  select(value: string): void {
    if (value !== this.value) {
      this.valueChange.emit(value);
    }
  }
}
