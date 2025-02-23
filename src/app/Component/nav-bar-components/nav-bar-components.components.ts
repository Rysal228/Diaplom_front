import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentTableComponent } from '../Elements/Transistors/component-table/component-table.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { StorageService } from '../../Services/storage.service';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  templateUrl: './nav-bar-components.components.html',
  styleUrls: ['./nav-bar-components.components.scss'],
  imports: [
    CommonModule,
    ComponentTableComponent,
    MatOptionModule,
    MatSelectModule
  ]
})
export class NavBarComponent {
  constructor( private storageService: StorageService){}
}
