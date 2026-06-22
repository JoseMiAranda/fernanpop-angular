import { Pipe, PipeTransform } from '@angular/core';
import { Category } from '../interfaces/category.interface';

@Pipe({
  name: 'categoryName',
  standalone: true,
})
export class CategoryNamePipe implements PipeTransform {
  transform(categoryId: string | undefined, categories: Category[]): string {
    if (!categoryId || !categories?.length) {
      return 'Sin categoría';
    }

    return categories.find((category) => category.id === categoryId)?.name ?? 'Sin categoría';
  }
}
