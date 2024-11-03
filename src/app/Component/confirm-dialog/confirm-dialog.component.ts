import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  imports: [
    MatButtonModule
  ]
})
export class ConfirmDialogComponent implements OnInit {

  confirmQuestion!: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:string) { }

  ngOnInit(): void {
    this.confirmQuestion = this.data;
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}
