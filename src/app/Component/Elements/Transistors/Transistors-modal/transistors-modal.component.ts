import { Component, Inject, OnInit } from '@angular/core';
import { TransistorService } from '../../../../Services/transistors.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ITransistors } from '../../../../models/transistors/transistors';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-transistor-modal',
  templateUrl: './transistors-modal.component.html',
  styleUrls: ['./transistors-modal.component.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule
  ]
})
export class TransistorModalComponent implements OnInit {
  transistor!: ITransistors;
  transistorForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private transistorService: TransistorService,
    private dialogRef: MatDialogRef<TransistorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ITransistors,
  ) {
    this.transistorForm = this.fb.group({
      id:[this.data?.id || null],
      part_number: ['',Validators.required],
      library_path: ['', [Validators.required, Validators.min(1)]],
      library_ref: ['', [Validators.required, Validators.min(1)]],
      footprint_path: ['', [Validators.required, Validators.min(1)]],
      footprint_ref: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
  if (this.data) {
    this.transistor = { ...this.data };
    this.transistorForm.patchValue({
      part_number: this.transistor.part_number,
      library_path: this.transistor.library_path,
      library_ref: this.transistor.library_ref,
      footprint_path : this.transistor.footprint_path,
      footprint_ref : this.transistor.footprint_ref
    });
  }
  }

//   openSnackBar(text: string) {
//     this.snackBar.openFromComponent(SnackbarComponent, {
//       data: text,
//       duration: 3000,
//     });
//   }

  onTransistorFormClose() {
    if (this.transistorForm.value.id) {
        this.updateDataRegion();
    } else {
        this.postDataRegion();
    }
  }

  updateDataRegion(){
    this.transistorService.updateTransistor(this.transistorForm.value).subscribe({
      next: () => {
        // this.openSnackBar('Регион сохранен');
        this.dialogRef.close();
      },
      error: (error) => {
        // this.openSnackBar('Ошибка при сохранении региона ' + `${error.status}` + ". Попробуйте снова.");
      }});
  }

  postDataRegion(){
    this.transistorService.createTransistor(this.transistorForm.value).subscribe({
      next: () => {
        // this.openSnackBar('Регион cохранен');
        this.dialogRef.close();
      },
      error: (error) => {
        // this.openSnackBar('Не получилось сохранить регион. ' + `${error.status}` + ". Попробуйте снова.")
      }});
  }
}
