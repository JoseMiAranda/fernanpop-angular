import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-drop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-drop.component.html',
  styleUrl: './image-drop.component.css'
})
export class ImageDropComponent {
  @Input() compact = false;
  @Input() single = false;

  @Output() onDrop = new EventEmitter<FileList>();

  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('dropZone') dropZoneRef?: ElementRef<HTMLElement>;
  @ViewChild('lblSelectedFiles') lblSelectedFilesRef?: ElementRef<HTMLElement>;

  private readonly validMimeTypes = new Set(['image/png', 'image/jpeg', 'image/jpg']);
  private readonly validExtensions = new Set(['.png', '.jpg', '.jpeg']);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.highlight();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.unhighlight();
  }

  onDropEvent(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.unhighlight();

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(files: FileList): void {
    let validFiles = Array.from(files).filter((file) => this.isValidImage(file));

    if (this.single && validFiles.length > 1) {
      validFiles = validFiles.slice(0, 1);
    }

    const fileInput = this.fileInputRef?.nativeElement;
    if (fileInput && validFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      validFiles.forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
    }

    this.updateLabel(validFiles.length);

    if (validFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      validFiles.forEach((file) => dataTransfer.items.add(file));
      this.onDrop.emit(dataTransfer.files);
    }
  }

  private isValidImage(file: File): boolean {
    if (file.type.startsWith('image/') && this.validMimeTypes.has(file.type)) {
      return true;
    }

    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    return this.validExtensions.has(extension);
  }

  private updateLabel(count: number): void {
    const label = this.lblSelectedFilesRef?.nativeElement;
    if (!label) {
      return;
    }

    if (this.single) {
      label.innerHTML = count > 0
        ? '<strong>1 imagen seleccionada</strong>'
        : (this.compact
          ? 'Añadir'
          : '<span class="font-semibold">Click aquí</span> o arrastra el archivo');
    } else {
      label.innerHTML = `<strong>${count} archivos seleccionados</strong>`;
    }
  }

  private highlight(): void {
    const dropZone = this.dropZoneRef?.nativeElement;
    if (!dropZone) {
      return;
    }

    dropZone.classList.remove('border-outline-variant');
    dropZone.classList.add('border-primary', 'bg-surface-container-high');
  }

  private unhighlight(): void {
    const dropZone = this.dropZoneRef?.nativeElement;
    if (!dropZone) {
      return;
    }

    dropZone.classList.remove('border-primary', 'bg-surface-container-high');
    dropZone.classList.add('border-outline-variant');
  }
}
