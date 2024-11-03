import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';

@Component({
selector: 'app-count-table',
standalone: true,
templateUrl: './count-table.component.html',
styleUrls: ['./count-table.component.scss'],
imports: [
  MatIconModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatTabsModule,
  MatTableModule
],
providers: []
})

export class CountTableComponent implements OnInit {
ngOnInit(): void {
    
}
}