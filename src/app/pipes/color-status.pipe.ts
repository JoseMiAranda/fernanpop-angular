import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'colorStatus',
  standalone: true
})
export class ColorStatusPipe implements PipeTransform {

  transform(value: string): any {
    if (value == 'in-process') return "";
    if (value == 'received') return "text-teal-500";
    return 'text-red-500';
  }

}
