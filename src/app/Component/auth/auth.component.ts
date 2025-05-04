import { ChangeDetectorRef, Component,OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { AuthService } from "../../Services/auth.service";
import { Router } from "@angular/router";
import { StorageService } from "../../Services/storage.service";
import { HttpErrorResponse } from "@angular/common/http";
import { SnackBarComponent } from '../snackbar/snackbar.component';
import { MatSnackBar } from "@angular/material/snack-bar";
@Component({
    selector: 'app-auth',
    standalone: true,
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    imports: [
        MatButtonModule,
        ReactiveFormsModule,
        CommonModule,
        MatInputModule,
        SnackBarComponent
    ]
})

export class AuthComponent implements OnInit {
    constructor(
        private fb: FormBuilder,
        private authService : AuthService,
        private router: Router,
        private snackBar: MatSnackBar,
        private storageService: StorageService,
        private cdf: ChangeDetectorRef
    ){
        this.authForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        })
        this.authFormRequest = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        })
    }
    logintrue = false;
    loginfalse = false;
    errorMessage: string | null = null;
    authFormRequest: FormGroup;
    authForm : FormGroup;
    ngOnInit(): void {
        if(this.storageService.onLogin()) {
            this.logintrue = true;
            this.router.navigate(['elementsBar']);
        }
    }
    onLogin(){
        this.authFormRequest.patchValue({
            username: this.authForm.value.username,
            password: this.authForm.value.password
        })
        this.authService.loginUser(this.authFormRequest.value).subscribe({
            next: token => {
            this.storageService.saveToken(token);
            this.openSnackBar('Вы успешно авторизовались');
            this.router.navigate(['elementsBar']);
            },
            error: err => {
            if (err.status === 400 || err.status === 401) {
                this.loginfalse = true;
                this.errorMessage = 'Неверный логин или пароль';
            }
            else if (err.status === 500) {
                this.errorMessage = 'Ошибка сервера. Попробуйте позже.';
            } 
            else {
                this.errorMessage = `Неизвестная ошибка: ${err.status}`;
            }
            this.cdf.detectChanges();
            }
        })
    }

    openSnackBar(text: string) {
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: text,
          duration: 5000
        });
    } 
}