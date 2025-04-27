import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatPaginatorModule } from "@angular/material/paginator";
import { PaginatorComponent } from "../paginator/paginator.component";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { debounceTime } from "rxjs";
import { SnackBarComponent } from "../snackbar/snackbar.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IPaginatorObject } from "../paginator/paginator-type";
import { UserService } from "../../Services/user.service";


@Component({
selector: 'app-users-table',
standalone: true,
templateUrl: './users-table.component.html',
styleUrls: ['./users-table.component.scss'],
encapsulation: ViewEncapsulation.None,
imports: [
  MatIconModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatTabsModule,
  MatTableModule,
  MatButtonModule,
  MatInputModule,
  MatDialogModule,
  MatPaginatorModule,
  CommonModule,
  MatOptionModule,
  MatSelectModule,
  ReactiveFormsModule,
  MatAutocomplete,
  PaginatorComponent
  ]
})

export class UsersTableComponent implements OnInit {
  constructor(
    private cdr: ChangeDetectorRef,
    private fb : FormBuilder,
    private dialog : MatDialog,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UsersTableComponent>,
    private userService: UserService
) {

}
  usersFilter = this.fb.group({
    limit: [10],
    offset: [0]
  });

  @ViewChild(PaginatorComponent) paginator!: PaginatorComponent;

  ngOnInit(): void {
      this.getUserList(this.usersFilter.value);
      this.userListChanges();
      this.cdr.detectChanges();
  }

  displayedColumns = ['username','role'];
  userList: any[] = [];
  len!: number;

  getUserList(body?: any){
    this.userService.getUsers(body).subscribe( (result) => {
        this.userList = result?.result;
        this.len = result?.total_count
    });
  }
  userListChanges(){
    this.usersFilter.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.getUserList(this.usersFilter.value);
    })
  }

  openSnackBar(text: string) {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: text,
      duration: 3000,
    });
  }

  onPaginatorChanged(paginator: IPaginatorObject) {
    this.usersFilter.patchValue({
      limit: paginator.limit,
      offset: paginator.offset
    });
  }

  onExit(){
    this.dialogRef.close();
  }
}