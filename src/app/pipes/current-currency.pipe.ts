import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monetary',
  standalone: true
})
export class CurrentCurrencyPipe implements PipeTransform {

  currentCurrency: string  = '€';

  transform(value: number): string {
    return `${value} ${this.currentCurrency}`;
  }

}
