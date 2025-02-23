import { Component,OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { RegistrationService } from "../../Services/registration.service";
import { Router } from "@angular/router";
import * as CryptoJS from 'crypto-js';

@Component({
    selector: 'app-registration',
    standalone: true,
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss'],
    imports: [
        MatButtonModule,
        ReactiveFormsModule,
        CommonModule,
        MatInputModule
    ]
})

export class registrationComponent implements OnInit {
    constructor(
        private fb: FormBuilder,
        private registrationService : RegistrationService,
        private router: Router
    ){
        this.registrationForm = this.fb.group({
            username: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', Validators.required]
        })
    }

    registrationForm : FormGroup;
    ngOnInit(): void {
    }

    onLogin(){
        const formData = this.registrationForm.value;
        
        const hashedPassword = CryptoJS.MD5(formData.password).toString();
        this.registrationForm.patchValue({
            password: hashedPassword
        })
        this.registrationService.registrationUser(this.registrationForm.value).subscribe( (result) => {
            this.router.navigate(['elementsBar']);
        })
    }
    
}