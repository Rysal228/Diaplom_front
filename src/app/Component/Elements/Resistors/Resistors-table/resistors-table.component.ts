import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ResistorService } from "../../../../Services/resistor.service";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from "@angular/material/button";

@Component({
selector: 'app-resistors-table',
standalone: true,
templateUrl: './resistors-table.component.html',
styleUrls: ['./resistors-table.component.scss'],
imports: [
  MatIconModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatTabsModule,
  MatTableModule,
  MatButtonModule
],
providers: []
})

export class ResistorsTableComponent implements OnInit {
    resistorList: any[] = [];
    columnsToDisplay = ['part_number', 'library_ref']
    len : number = 0;
    capacitors: any[] = [];
    constructor(
      private resistorService: ResistorService,
      private cdr: ChangeDetectorRef) { }
  
    ngOnInit() {
      this.resistorService.getResistors({limit: 10}).subscribe(data => {
        this.resistorList = data.register_list;
        this.cdr.detectChanges();
        this.len = data.len;
        console.log(data);
      });
    }
}