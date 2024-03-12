import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
  standalone: true
})
export class StatusPipe implements PipeTransform {

  transform(value: string): any {
    if (value == 'in-process') return "En progreso";
    if (value == 'received') return "Recibido";
    return 'Cancelado';
  }

}
