import {Component, Injectable} from '@angular/core';
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {Subject} from 'rxjs';

@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  // For internationalization, the `$localize` function from
  // the `@angular/localize` package can be used.
  firstPageLabel = `Первая страница`;
  itemsPerPageLabel = `Кол-во элементов:`;
  lastPageLabel = `Последняя страница`;

  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  nextPageLabel = 'Следующая страница';
  previousPageLabel = 'Предыдущая страница';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return `Найдено элементов: ${length}`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Найдено элементов: ${length} Страница ${page + 1} из ${amountPages}`;
  }
}