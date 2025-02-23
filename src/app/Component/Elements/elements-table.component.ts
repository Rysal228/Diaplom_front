import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../nav-bar-components/nav-bar-components.components';
import { ComponentTableComponent } from './Transistors/component-table/component-table.component';
@Component({
  selector: 'app-elements-table',
  standalone: true,
  templateUrl: './elements-table.component.html',
  styleUrls: ['./elements-table.component.scss'],
  imports: [
    CommonModule,
    NavBarComponent,
    ComponentTableComponent
  ]
})
export class ElementsTableComponent {

}
