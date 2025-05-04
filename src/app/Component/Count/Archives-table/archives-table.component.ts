import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ArchiveService } from '../../../Services/archives.service';
import { IArchive, IArchiveResponseList } from '../../../models/archive-response';
import { SnackBarComponent } from '../../snackbar/snackbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormBuilder } from '@angular/forms';
import { IPaginatorObject } from '../../paginator/paginator-type';
import { MatPaginatorModule } from "@angular/material/paginator";
import { PaginatorComponent } from '../../paginator/paginator.component';
import { debounceTime } from 'rxjs';
import { StorageService } from '../../../Services/storage.service';
import { ConfirmDialogService } from '../../confirm-dialog/confirm-dialog.service';
@Component({
  selector: 'app-archives-table',
  templateUrl: './archives-table.component.html',
  styleUrls: ['./archives-table.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    CommonModule,
    MatPaginatorModule,
    PaginatorComponent
  ]
})
export class ArchiveTableComponent implements OnInit {
  archives: IArchive[] = [];
  loading = false;

  constructor(
    private archiveService: ArchiveService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private storageService: StorageService,
    private cdf: ChangeDetectorRef,
    private confirmDialogService: ConfirmDialogService
  ) {}

  paginatorArchives = this.fb.group({
    limit: 10,
    offset: 0
  })

  ngOnInit(): void {
    this.getArchives(this.paginatorArchives.value);
    this.archivesListChanges();
  }
  displayedColumns = ["filename","upload_date","action"];
  len : number = 0;

  getArchives(body? : any) {
    this.loading = true;
    this.archiveService.UserArchivesList(body).subscribe({
      next: list => {
        this.archives = list.result;
        this.len = list.total_count;
        this.loading = false;
        this.cdf.detectChanges();
      },
      error: err => {
        this.openSnackBar(`Не удалось загрузить записи.${err.message}`)
        this.loading = false;
      }
    });
  }

  onDownload(record: IArchive) {
    console.log(record)
    this.archiveService.downloadArchive(record.id).subscribe({
      next: blob => {
        const filename = record.path.split(/[\\/]/).pop() || `archive-${record.id}.zip`;
        saveAs(blob, filename);
      },
      error: err => {
        this.openSnackBar(`Ошибка при скачивании: ${err.status}`);
      }
    });
  }

  openComponentDeleteModal(body: any){
    const textAction = `
    <h2>Вы уверены, что хотите удалить архив?</h2>`
    this.confirmDialogService.openConfirmDialog(textAction).subscribe((result: boolean) => {
      if (result) {
        this.ComponentDelete(body);
      }
    });
  }

  ComponentDelete(body: any){
    this.archiveService.deleteArchive(body.id).subscribe({
      next: () => {
        this.openSnackBar('Компонент удален');
        this.getArchives(this.paginatorArchives.value);
      },
      error: (error) => {
        this.openSnackBar('Ошибка при удалении компонента ' + `${error.status}` + ". Попробуйте снова.");
      }});
  }

  archivesListChanges(){
    this.paginatorArchives.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.getArchives(this.paginatorArchives.value);
    })
  }

  get isRole(): string {
    return this.storageService.getUserRole();
  }

  openSnackBar(text: string) {
    this.snackBar.openFromComponent(SnackBarComponent, {
        data: text,
        duration: 5000
    });
  }
  
  onPaginatorChanged(paginator: IPaginatorObject) {
    this.paginatorArchives.patchValue({
        limit: paginator.limit,
        offset: paginator.offset
    });
  }

}
