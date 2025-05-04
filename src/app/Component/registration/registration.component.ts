import { Component,Inject,OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { RegistrationService } from "../../Services/registration.service";
import { Router } from "@angular/router";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatOptionModule } from "@angular/material/core";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { UserService } from "../../Services/user.service";
import { SnackBarComponent } from "../snackbar/snackbar.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'app-registration',
    standalone: true,
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss'],
    imports: [
        MatButtonModule,
        ReactiveFormsModule,
        CommonModule,
        MatInputModule,
        MatOptionModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatIconModule
    ]
})

export class RegistrationComponent implements OnInit {
    constructor(
        private fb: FormBuilder,
        private registrationService : RegistrationService,
        private usersService: UserService,
        private router: Router,
         private snackBar: MatSnackBar,
        private dialogRef : MatDialogRef<RegistrationComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ){
        this.registrationForm = this.fb.group({
            id: null,
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
            role: ['', Validators.required],
            create_date: ['']
          }, { validator: this.passwordMatchValidator });
    }

    roles = [
        { value: 'user', viewValue: 'Пользователь' },
        { value: 'admin', viewValue: 'Администратор' },
        { value: 'moderator', viewValue: 'Модератор' },
        { value: 'buyer', viewValue: 'Менеджер по закупкам' }
    ];
    hidePassword = true;
    hideConfirmPassword = true;
    registrationForm : FormGroup;
    ngOnInit(): void {
        if (this.data){
            this.usersService.getUserById(this.data?.id).subscribe( result => {
                this.registrationForm.patchValue({
                    id: this?.data?.id,
                    username : this?.data?.username,
                    email : this?.data?.email,
                    role: this?.data?.role,
                    create_date: this?.data?.create_date
                })
            })
        }
    }

    onCreateAccount(){
        if (this.data?.id){
            this.usersService.updateUserById(this.registrationForm.value).subscribe({ next: result =>{
                this.openSnackBar('Данные о пользователе были успешно обновлены!')
                this.onExit();
            },
            error : error =>{
                if (error.status == 404){
                    this.openSnackBar(`Ошибка: ${error.status}. Пользователь не найден`);
                }
                else if (error.status == 400){
                    this.openSnackBar(`Ошибка: ${error.status}. Все поля должны быть заполнены`);
                }
                else if (error.status == 403){
                    this.openSnackBar(`Ошибка: ${error.status}. Недостаточно прав для данного действия`);
                }
                else {
                    this.openSnackBar(`Неизвестная ошибка: ${error.status}`);
                }
            }}
        )
        }
        else {
            this.registrationService.registrationUser(this.registrationForm.value).subscribe({ next: result => {
                this.openSnackBar('Новый пользователь был успешно добавлен!')
                this.onExit();
            },
            error : error => {
                if (error.status == 404){
                    this.openSnackBar(`Ошибка: ${error.status}. Пользователь не найден`);
                }
                else if (error.status == 400){
                    this.openSnackBar(`Ошибка: ${error.status}. Данный логин уже существует`);
                }
                else if (error.status == 403){
                    this.openSnackBar(`Ошибка: ${error.status}. Недостаточно прав для данного действия`);
                }
                else {
                    this.openSnackBar(`Неизвестная ошибка: ${error.status}`);
                }
            }})
        }
    }
    onExit(){
        this.dialogRef.close();
    }

    passwordMatchValidator(formGroup: FormGroup) {
        const password = formGroup.get('password')?.value;
        const confirmPassword = formGroup.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { mismatch: true };
    }

    openSnackBar(text: string) {
        this.snackBar.openFromComponent(SnackBarComponent, {
            data: text,
            duration: 5000
        });
    } 

}