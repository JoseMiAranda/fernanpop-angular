import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  signal,
} from '@angular/core';
import { DropdownMenuItem } from './dropdown-menu-item.model';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-menu.component.html',
})
export class DropdownMenuComponent {
  @Input({ required: true }) items!: DropdownMenuItem[];
  @Input() triggerIcon = 'pi pi-ellipsis-v';
  @Input() ariaLabel = 'Abrir menú';

  open = signal(false);

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  toggle(event: MouseEvent) {
    event.stopPropagation();
    this.open.update((value) => !value);
  }

  onItemClick(item: DropdownMenuItem) {
    item.action?.();
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.open.set(false);
  }
}
