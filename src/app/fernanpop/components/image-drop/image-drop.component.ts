import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-drop',
  standalone: true,
  imports: [],
  templateUrl: './image-drop.component.html',
  styleUrl: './image-drop.component.css'
})
export class ImageDropComponent implements OnInit {
  ngOnInit(): void {
    const lblSelectedFiles = document.querySelector(
      "#lbl-selected-files"
    ) as HTMLParagraphElement;
    const dropZone = document.querySelector("#drop-zone") as HTMLLabelElement;
    const fileInput = document.querySelector(
      "#file-upload"
    ) as HTMLInputElement;


    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = (e: DragEvent) => {
      dropZone.classList.remove('border-gray-300');
      dropZone.classList.add('border-blue-500', 'bg-blue-50');
    };

    const unHighlight = (e: DragEvent) => {
      dropZone.classList.remove('border-blue-500', 'bg-blue-50');
      dropZone.classList.add('border-gray-300');
    };

    const createFileList = (files: File[]): FileList => {
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      return dataTransfer.files;
    }

    const handleFiles = (files: FileList) => {
      const validFiles = Array.from(files).filter(
        file => file.type.startsWith('image/')
      );

      if (fileInput && validFiles.length > 0) {
        fileInput.files = createFileList(validFiles);
      }

      lblSelectedFiles.innerHTML = `<strong>${validFiles.length} archivos seleccionados</strong>`
    };

    (['dragenter', 'dragover', 'dragleave', 'drop'] as const).forEach(
      (eventName) => {
        dropZone.addEventListener(eventName, preventDefaults);
        document.body.addEventListener(eventName, preventDefaults);
      }
    );

    (['dragenter', 'dragover'] as const).forEach(
      (eventName) => {
        dropZone.addEventListener(eventName, highlight);
      }
    );

    (['dragleave', 'drop'] as const).forEach(
      (eventName) => {
        dropZone.addEventListener(eventName, unHighlight);
      }
    );

    // Sólo imágenes
    dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer?.files;

      if (files) {
        handleFiles(files);
      }
    });
  }
}
