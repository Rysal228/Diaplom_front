import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../nav-bar-components/nav-bar-components.components';
@Component({
  selector: 'app-elements-table',
  standalone: true,
  templateUrl: './elements-table.component.html',
  styleUrls: ['./elements-table.component.scss'],
  imports: [
    CommonModule,
    NavBarComponent
  ]
})
export class ElementsTableComponent {

}
