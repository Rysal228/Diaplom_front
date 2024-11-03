import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResistorsTableComponent } from '../Elements/Resistors/Resistors-table/resistors-table.component';
import { TransistorsTableComponent } from '../Elements/Transistors/Transistors-table/transistors-table.component';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  templateUrl: './nav-bar-components.components.html',
  styleUrls: ['./nav-bar-components.components.scss'],
  imports: [
    CommonModule,
    ResistorsTableComponent,
    TransistorsTableComponent
  ]
})
export class NavBarComponent {
    selectedIndex: number = 0; 

    selectItem(index: number) {
      this.selectedIndex = index;
    }
}
