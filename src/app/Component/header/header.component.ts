import {Component, OnInit } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTabsModule } from "@angular/material/tabs";
import { CommonModule } from "@angular/common";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { Router } from "@angular/router";
@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [
       CommonModule,
       MatIconModule,
       MatTooltipModule,
       MatDialogModule,
       MatButtonModule,
    //   MatAutocompleteModule,
       MatTabsModule,
    //   MatTableModule
    ],
    providers: []
    })
    
    export class HeaderComponent implements OnInit {
    
     constructor(
        private router: Router,
     ){}
     ngOnInit(): void {
         
     }

    componentPage(){
        this.router.navigate(['elementsBar'])
    }
    countPage(){
        this.router.navigate(['count'])
    }
    logout(){

    }
    }