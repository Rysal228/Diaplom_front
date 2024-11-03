import { Component,OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { AuthService } from "../../Services/auth.service";
import { Router } from "@angular/router";
@Component({
    selector: 'app-auth',
    standalone: true,
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    imports: [
        MatButtonModule,
        ReactiveFormsModule,
        CommonModule,
        MatInputModule
    ]
})

export class AuthComponent implements OnInit {
    constructor(
        private fb: FormBuilder,
        private authService : AuthService,
        private router: Router
    ){
        this.authForm = this.fb.group({
            login: ['', Validators.required],
            password: ['', Validators.required]
        })
    }

    authForm : FormGroup;
    ngOnInit(): void {
        
    }

    onLogin(){
        console.log(this.authForm.value);
        this.authService.loginUser(this.authForm.value).subscribe( (result) => {
            this.router.navigate(['elementsBar']);
            console.log(result);
        })
    }
    
}