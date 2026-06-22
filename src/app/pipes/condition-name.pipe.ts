import { Pipe, PipeTransform } from '@angular/core';
import { PRODUCT_CONDITIONS, ProductCondition } from '../interfaces/product.interface';

@Pipe({
  name: 'conditionName',
  standalone: true,
})
export class ConditionNamePipe implements PipeTransform {
  transform(conditionId: ProductCondition | string | undefined): string {
    if (!conditionId) {
      return '';
    }

    return PRODUCT_CONDITIONS.find((condition) => condition.id === conditionId)?.name ?? '';
  }
}
