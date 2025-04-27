import { Component,OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { RegistrationService } from "../../Services/registration.service";
import { Router } from "@angular/router";
import * as CryptoJS from 'crypto-js';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatOptionModule } from "@angular/material/core";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";

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
        private router: Router,
        private dialogRef : MatDialogRef<RegistrationComponent>
    ){
        this.registrationForm = this.fb.group({
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
            role: ['', Validators.required]
          }, { validator: this.passwordMatchValidator });
    }

    roles = ["Пользователь","Администратор","Модератор","Менеджер по закупкам"];
    hidePassword = true;
    hideConfirmPassword = true;
    registrationForm : FormGroup;
    ngOnInit(): void {
    }

    onCreateAccount(){
        this.registrationService.registrationUser(this.registrationForm.value).subscribe( (result) => {
            this.onExit();
        })
    }
    onExit(){
        this.dialogRef.close();
    }

    passwordMatchValidator(formGroup: FormGroup) {
        const password = formGroup.get('password')?.value;
        const confirmPassword = formGroup.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { mismatch: true };
    }
}