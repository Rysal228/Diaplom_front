import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogCreateComponent } from './confirm-dialog-create.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  constructor(private dialog: MatDialog) { }

  openConfirmDialog(data: string): Observable<boolean> {
    const dialogRef: MatDialogRef<ConfirmDialogCreateComponent> = this.dialog.open(ConfirmDialogCreateComponent, {
      width: '500px',
      data: data
    });
    return dialogRef.afterClosed();
  }

}
