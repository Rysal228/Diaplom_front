import {Component, OnInit } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTabsModule } from "@angular/material/tabs";
import { CommonModule } from "@angular/common";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { Router } from "@angular/router";
import { StorageService } from "../../Services/storage.service";
import { AuthService } from "../../Services/auth.service";
import { ThemeService } from "../../Services/theme.service";
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
        public storageService: StorageService,
        public authService : AuthService,
        public themeService: ThemeService
     ){
      this.isDark = this.themeService.isDarkTheme();

     }
     isDark: boolean;
     ngOnInit(): void {
     }

    componentPage(){
        this.router.navigate(['elementsBar'])
    }
    countPage(){
        this.router.navigate(['count'])
    }
    logout(){
      this.storageService.onLogout();
    }

   toggleTheme(): void {
      this.themeService.toggleTheme();
      this.isDark = this.themeService.isDarkTheme();
   }

}