import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-confirm-dialog-create',
  standalone: true,
  templateUrl: './confirm-dialog-create.component.html',
  styleUrls: ['./confirm-dialog-create.component.scss'],
  imports: [
    MatButtonModule,
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class ConfirmDialogCreateComponent implements OnInit {

    constructor(
    public dialogRef: MatDialogRef<ConfirmDialogCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: boolean) { }
    isCopyDisabled: boolean = false;
    ngOnInit(): void {
        this.isCopyDisabled = this.data;
    }

    // onNoClick(): void {
    //  this.dialogRef.close(false);
    // }

}
