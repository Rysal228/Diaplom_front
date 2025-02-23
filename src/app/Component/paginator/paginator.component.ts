import { Component, EventEmitter, Input, Output, } from '@angular/core';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { IPaginatorObject } from './paginator-type';

@Component({
    selector: 'app-paginator',
    templateUrl: './paginator.component.html',
    styleUrls: ['./paginator.component.scss'],
    standalone: true,
    imports: [MatPaginatorModule]
})
export class PaginatorComponent {

  @Input() length!: number;

  paginator: IPaginatorObject = {
    offset: 0,
    limit: 10
  };
  pageSizeOptions = [10, 15, 30, 50];

  getPageIndex() {
    return this.paginator.offset / this.paginator.limit;
  }

  resetOffset() {
    this.paginator.offset = 0
    this.paginatorChanged.emit(this.paginator)
  }

  onPaginatorEvent(e: PageEvent) {
    this.paginator.limit = e.pageSize
    this.paginator.offset = e.pageIndex * e.pageSize

    this.paginatorChanged.emit(this.paginator)
  }
  @Output()
  paginatorChanged: EventEmitter<IPaginatorObject> = new EventEmitter<IPaginatorObject>();
}