import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'colorStatus',
  standalone: true
})
export class ColorStatusPipe implements PipeTransform {

  transform(value: string): any {
    if (value == 'in-process') return "bg-gray-500";
    if (value == 'received') return "bg-teal-500";
    return 'bg-red-500';
  }

}
