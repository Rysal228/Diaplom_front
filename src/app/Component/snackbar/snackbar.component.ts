import {Component, Inject, inject} from '@angular/core';
import {
    MAT_SNACK_BAR_DATA,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';

@Component({
    selector: 'app-snack-bar',
    standalone: true,
    templateUrl: './snackbar.component.html',
    styleUrls: ['./snackbar.component.scss'],
    imports: [MatButtonModule, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
  })
  export class SnackBarComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
    snackBarRef = inject(MatSnackBarRef);
  }