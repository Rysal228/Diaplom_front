import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { ComponentService } from "../../../../Services/component.service";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { ComponentModalComponent } from "../component-modal/component-modal.component";
import { ConfirmDialogService } from "../../../confirm-dialog/confirm-dialog.service";
import { MatPaginatorIntl, MatPaginatorModule } from "@angular/material/paginator";
import { PaginatorComponent } from "../../../paginator/paginator.component";
import { StorageService } from "../../../../Services/storage.service";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { CommonModule } from "@angular/common";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { debounceTime } from "rxjs";
import { SnackBarComponent } from '../../../snackbar/snackbar.component';
import { MatSnackBar } from "@angular/material/snack-bar";
import { IPaginatorObject } from "../../../paginator/paginator-type";
import { ExportAndImportService } from "../../../../Services/export-and-import-BD.service";


@Component({
selector: 'app-component-table',
standalone: true,
templateUrl: './component-table.component.html',
styleUrls: ['./component-table.component.scss'],
encapsulation: ViewEncapsulation.None,
imports: [
  MatIconModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatTabsModule,
  MatTableModule,
  MatButtonModule,
  MatInputModule,
  MatDialogModule,
  MatPaginatorModule,
  CommonModule,
  MatOptionModule,
  MatSelectModule,
  ReactiveFormsModule,
  MatAutocomplete,
  ComponentTableComponent,
  PaginatorComponent
  ]
})

export class ComponentTableComponent implements OnInit {
  constructor(
    private componentService: ComponentService,
    private confirmDialogService: ConfirmDialogService,
    private cdr: ChangeDetectorRef,
    private fb : FormBuilder,
    private dialog : MatDialog,
    private snackBar: MatSnackBar,
    private exportAndImportService: ExportAndImportService,
    private storageService: StorageService) {

   }
  @ViewChild(PaginatorComponent) paginator!: PaginatorComponent;
  componentList: any[] = [];
  tableList: any[] = [];
  tableListFilter = this.fb.control<string>('');
  columnListFilter = this.fb.control<string>('');
  columnList: any[] = [];
  displayedColumns: string[] = this.columnList
  .filter(col => !['id','Footprint Ref', 'Library Path', 'Library Ref', 'Footprint Path'].includes(col.key))
  .map(col => col.key);
  len : number = 0;
  tableUrl: string = '';
  defaultTableName: string = '';
  tableFilter = this.fb.group({
    name_filter: [''],
    limit: 10,
    offset: 0
  })

  columnFilter = this.fb.group({
    name_filter: [''],
    limit: 10,
    offset: 0
  })

  sortingValue = [
    {id:1, name:"По убыванию", value: -1},
    {id:2, name:"По умолчанию", value: 0},
    {id:3, name:"По возрастанию", value: 1}
  ]
  componentsFilter = this.fb.group({
    columns: this.fb.array([]),
    property_sort_name: '',
    property_sort: 0,
    offset: [0],
    limit: [10]
  });

  ngOnInit() {
    this.getTableList(this.tableFilter.value);
    this.tableListFilterChange();
    this.columnListFilterChange();
    this.componentsFilterChange();
    this.cdr.detectChanges();
  }

  get isRole(): string {
    return this.storageService.getUserRole();
  }

  exportBD() {
    this.exportAndImportService.exportBD().subscribe(blob => {
      // Создаем временную ссылку
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Указываем имя скачиваемого файла
      a.download = 'database_export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  selectedFile: File | null = null;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  
    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
  
  importBD() {
    if (!this.selectedFile) {
      this.openSnackBar("Файл не выбран")
      return;
    }
  
    const formData = new FormData();
    formData.append("file", this.selectedFile);
  
    this.exportAndImportService.importBD(formData).subscribe({
      next : response => {
        this.openSnackBar("Файл успешно загружен")
      },
      error : error => {
        if (error.status == 403){
          this.openSnackBar(`Ошибка загрузки, ${error.error.detail}. Недостаточно прав`)
        }
        else if (error.status == 400){
          this.openSnackBar(`Ошибка загрузки, ${error.error.detail}. Ошибка при разборе JSON`)
        }
        else if (error.status == 500) {
          this.openSnackBar(`Ошибка загрузки, ${error.error.detail}`);
        }
        else {
        this.openSnackBar(`Ошибка загрузки, ${error.error.detail}`)
        }
      }
    }
    );
  }
  

  tableListFilterChange(){
    this.tableFilter.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.getTableList(this.tableFilter.value);
      this.getColumnList(this.tableUrl);
    })
    this.tableListFilter.valueChanges.subscribe(() =>{
      this.tableFilter.patchValue({
        name_filter: this.tableListFilter.value
      })
    })
  }
  columnListFilterChange(){
    this.columnFilter.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.getColumnList(this.tableUrl);
    })
    this.columnListFilter.valueChanges.subscribe(() =>{
      this.columnFilter.patchValue({
        name_filter: this.columnListFilter.value
      })
      this.componentsFilter.patchValue({
        property_sort_name: this.columnListFilter.value
      })
    })
  }

  getTableList(body?: any) {
    this.componentService.getTables(body).subscribe({ next :result => {
      this.tableList = result.table_list;
      this.cdr.detectChanges();
    },
    error: err =>{
      this.openSnackBar(`Ошибка при получении списка таблиц. ${err.error.detail}`)
    }})
  }
    getColumnList(name: any) {
      this.componentService.getColumns(name, {name_filter:"", limit:10, offset:0}).subscribe({ next: result => {
        const columns = this.componentsFilter.get('columns') as FormArray;
        columns.clear();
        
        result.forEach((col: any) => {
          if (!['id', 'Footprint Ref', 'Library Path', 'Library Ref', 'Footprint Path'].includes(col.column)) {
            columns.push(this.fb.group({
              name: [col.column],
              property_filter: ['']
            }));
          }
        });
          this.displayedColumns = result
          .filter((col: any) => !['id', 'Footprint Ref', 'Library Path', 'Library Ref', 'Footprint Path'].includes(col.column))
          .map((col: any) => col.column);
        this.cdr.detectChanges();

        
        this.getComponentList(this.componentsFilter.value);
      }, error : err => {
        this.openSnackBar(`Ошибка при получении списка колонок таблицы. ${err.error.detail}`)
      }});
    }

    getColumnFilterControl(column: string): FormControl {
      const columns = this.componentsFilter.get('columns') as FormArray;
    
      const columnGroup = columns.controls.find((group: AbstractControl) => {
        return (group as FormGroup).get('name')?.value === column;
      }) as FormGroup | undefined;
    
      return columnGroup ? columnGroup.get('property_filter') as FormControl : new FormControl('');
    }
    
    
    onFilterChange(column: string) {
      const control = this.getColumnFilterControl(column);
      if (control) {
        const filterValue = control.value;
        this.updateFilters();
      }
    }

    updateFilters() {
      const filterData = this.componentsFilter.value;
      this.getComponentList(filterData);
    }
    
    
  componentsFilterChange(){
    this.componentsFilter.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.getComponentList(this.componentsFilter);
    })
  }

  openComponentModal(component?: any) {
    const dialogRef = this.dialog.open(ComponentModalComponent, {
      data: {
        component: component,
        tableListFilter: this.tableListFilter.value
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getComponentList(this.componentsFilter.value);
    });
  }

  getComponentList(body: any){
    this.componentService.getComponentList(this.tableUrl, this.componentsFilter.value).subscribe(data => {
      this.componentList = data.component_list;
      this.cdr.detectChanges();
      this.len = data.total_count;
    });
  }

  openComponentDeleteModal(component: any){
    const textAction = `
    <h2>Вы уверены, что хотите удалить компонент?</h2>
    <br>
    <div>${component?.['Part Number']}</div>`
    this.confirmDialogService.openConfirmDialog(textAction).subscribe((result: boolean) => {
      if (result) {
        this.ComponentDelete(component);
      }
    });
  }
  
  ComponentDelete(component: any){
    this.componentService.deleteComponent(component.id, this.tableListFilter.value).subscribe({
      next: () => {
        this.openSnackBar('Компонент удален');
        this.getComponentList(this.componentsFilter.value);
      },
      error: (error) => {
        this.openSnackBar('Ошибка при удалении компонента ' + `${error.status}` + ". Попробуйте снова.");
      }});
  }

  openSnackBar(text: string) {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: text,
      duration: 5000,
    });
  }
  onTableSelected(table: { name: string }){
    this.tableFilter.patchValue({
      name_filter: table.name
    })
    this.tableUrl= table.name;
  }

  clearTableListFilter(){
    this.tableFilter.patchValue({
      name_filter: ''
    })
    this.tableUrl = ''
  }

  onPaginatorChanged(paginator: IPaginatorObject) {
    this.componentsFilter.patchValue({
      limit: paginator.limit,
      offset: paginator.offset
    });
  }

  onColumnSelected(column : string){
    this.componentsFilter.patchValue({
      property_sort_name: column
    })
  }

  clearColumnListFilter(){
    this.columnFilter.patchValue({
      name_filter: ''
    })
    this.componentsFilter.patchValue({
      property_sort_name: '',
      property_sort: 0
    })
  }
}