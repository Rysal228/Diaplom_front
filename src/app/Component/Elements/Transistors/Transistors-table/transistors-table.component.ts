import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { TransistorService } from "../../../../Services/transistors.service";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from "@angular/material/button";
import { ITransistors } from "../../../../models/transistors/transistors";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { TransistorModalComponent } from "../Transistors-modal/transistors-modal.component";
import { ConfirmDialogService } from "../../../confirm-dialog/confirm-dialog.service";
import { MatPaginatorIntl, MatPaginatorModule } from "@angular/material/paginator";
import { MyCustomPaginatorIntl } from "../../../paginator/paginator";


@Component({
selector: 'app-transistors-table',
standalone: true,
templateUrl: './transistors-table.component.html',
styleUrls: ['./transistors-table.component.scss'],
imports: [
  MatIconModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatTabsModule,
  MatTableModule,
  MatButtonModule,
  MatDialogModule,
  MatPaginatorModule
  ],
  providers: [{provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl}],
})

export class TransistorsTableComponent implements OnInit {
    transistorList: any[] = [];
    columnsToDisplay = ['part_number', 'library_path','library_ref','footprint_path','footprint_ref']
    len : number = 0;
    constructor(
      private transistorService: TransistorService,
      private confirmDialogService: ConfirmDialogService,
      private cdr: ChangeDetectorRef,
    private dialog : MatDialog) { }
  
    ngOnInit() {
      this.getTransistors();
    }

    openTransistorModal(transistor?: ITransistors) {
      const dialogRef = this.dialog.open(TransistorModalComponent, {
        data: transistor,
        disableClose: true,
        width: '350px',
      });
      dialogRef.afterClosed().subscribe(() => {
        this.getTransistors();
      });
    }
    getTransistors(){
      this.transistorService.getTransistors({limit: 10}).subscribe(data => {
        this.transistorList = data.transistor_list;
        this.cdr.detectChanges();
        this.len = data.len;
        console.log(data);
      });
    }
    openTransistorDeleteModal(transistor: ITransistors){
      const textAction = `
      <h2>Вы уверены, что хотите удалить транзистор?</h2>
      <br>
      <div>${transistor?.part_number}</div>`
      this.confirmDialogService.openConfirmDialog(textAction).subscribe((result: boolean) => {
        if (result) {
          this.TransistorDelete(transistor);
        }
      });
    }
  
    TransistorDelete(transistor: ITransistors){
      this.transistorService.deleteTransistor(transistor).subscribe({
        next: () => {
          // this.openSnackBar('Транзистор удален');
          this.getTransistors();
        },
        error: (error) => {
          // this.openSnackBar('Ошибка при удалении региона ' + `${error.status}` + ". Попробуйте снова.");
        }});
  }
}