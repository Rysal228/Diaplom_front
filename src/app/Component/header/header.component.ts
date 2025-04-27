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
import { RegistrationComponent } from "../registration/registration.component";
import { MatDialog } from "@angular/material/dialog";
import {MatMenuModule} from '@angular/material/menu';
import { UsersTableComponent } from "../users-table/users-table.component";

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
       MatTabsModule,
       RegistrationComponent,
       MatMenuModule
    ],
    providers: []
    })
    
    export class HeaderComponent implements OnInit {
    
   constructor(
      private router: Router,
      public storageService: StorageService,
      public authService : AuthService,
      public themeService: ThemeService,
      private dialog: MatDialog
   ){
   this.isDark = this.themeService.isDarkTheme();
   }

   isDark: boolean;


   ngOnInit(): void {

   }

   get isRole(): string {
      return this.storageService.getUserRole();
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

   openRegistrationModal(){
      const dialogRef = this.dialog.open(RegistrationComponent,{
         width: "auto",
         height: "auto",
         disableClose: true
      })
   }
   openUsersModal(){
      const dialogRef = this.dialog.open(UsersTableComponent, {
         width: "auto",
         height: "auto",
         disableClose: true
      })
   }
}