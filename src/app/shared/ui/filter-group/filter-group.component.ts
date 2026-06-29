import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-filter-group',
  standalone: true,
  templateUrl: './filter-group.component.html',
})
export class FilterGroupComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) options: FilterOption[] = [];
  @Input() value = '';
  @Input() name = '';
  @Output() valueChange = new EventEmitter<string>();

  select(value: string): void {
    this.valueChange.emit(value);
  }
}
