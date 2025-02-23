import { Component,OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { AuthService } from "../../Services/auth.service";
import { Router } from "@angular/router";
import { registrationComponent } from "../registration/registration.component";
import { StorageService } from "../../Services/storage.service";
import * as CryptoJS from 'crypto-js';
import { HttpErrorResponse } from "@angular/common/http";
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
        registrationComponent
    ]
})

export class AuthComponent implements OnInit {
    constructor(
        private fb: FormBuilder,
        private authService : AuthService,
        private router: Router,
        private storageService: StorageService
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
    authFormRequest: FormGroup;
    authForm : FormGroup;
    ngOnInit(): void {
        if(this.storageService.onLogin()) {
            this.logintrue = true;
            this.router.navigate(['elementsBar']);
        }
    }

    onLogin(){
        const formData = this.authForm.value;
        
        // const hashedPassword = CryptoJS.MD5(formData.password).toString();
        this.authFormRequest.patchValue({
            username: this.authForm.value.username,
            password: this.authForm.value.password
        })
        this.authService.loginUser(this.authFormRequest.value).subscribe({
            next: token => {
            this.storageService.saveToken(token)
            this.router.navigate(['elementsBar']);
            },
            error: err => {
             if(err instanceof HttpErrorResponse &&  err.status == 400) {
                this.loginfalse = true;
             }
            }
        })
    }
    
}