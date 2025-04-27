import { MatPaginatorIntl } from '@angular/material/paginator';

export class CustomPaginatorIntl extends MatPaginatorIntl {
  constructor() {
    super();
    this.getAndInitTranslations();
  }

  getAndInitTranslations() {
    this.itemsPerPageLabel = 'Элементов на странице:';
    this.nextPageLabel = 'Следующая страница';
    this.previousPageLabel = 'Предыдущая страница';
    this.firstPageLabel = 'Первая страница';
    this.lastPageLabel = 'Последняя страница';
    this.changes.next();
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 из ${length}`;
    }
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `${startIndex + 1} – ${endIndex} из ${length}`;
  };
}
