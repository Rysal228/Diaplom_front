import { Component, Inject, OnInit } from '@angular/core';
import { ComponentService } from '../../../../Services/component.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { debounceTime } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { IComponentsFolderOne, IComponentsFolderOneRequest } from '../../../../models/components-folder.ts/components-folder-one';
import { SnackBarComponent } from '../../../snackbar/snackbar.component';
@Component({
  selector: 'app-component-modal',
  templateUrl: './component-modal.component.html',
  styleUrls: ['./component-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatSelectModule
  ]
})
export class ComponentModalComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private componentService: ComponentService,
    private dialogRef: MatDialogRef<ComponentModalComponent>,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.componentForm = this.fb.group({
      id: [null],
      columns: this.fb.array([]),
    });
  }
  
  component!: any;
  componentForm: FormGroup;
  
  componentUrl: string = '';
  typeOfComponentUrl: string = '';
  libraryPathOptions: string[] = [];
  footprintPathOptions: string[] = [];
  componentList: IComponentsFolderOne[] = [];
  typeOfComponentList: IComponentsFolderOne[] = [];
  componentListFilter = this.fb.nonNullable.control<string>('');
  typeOfComponentListFilter = this.fb.nonNullable.control<string>('');
  libraryPathListFilter = this.fb.nonNullable.control<string>('');
  footprintPathListFilter = this.fb.nonNullable.control<string>('');
  columnListFilter = this.fb.control<string>('');

  componentFilter = this.fb.nonNullable.group({
    name_filter: '',
    limit: 10,
    offset: 0
  });

  componentTypeFilter = this.fb.nonNullable.group({
    name_filter: '',
    limit: 10,
    offset: 0
  });
  pcb_and_sch_filters = this.fb.nonNullable.group({
    pcb_name_filter: '',
    sch_name_filter: ''
  })

  ngOnInit(): void {
    if (this.data) {
      this.component = { ...this.data };
      this.componentForm.patchValue({
        id: this.data.id
      });
      this.componentUrl = this.component.tableUrl || '';
      this.componentListFilter.setValue(this.componentUrl);
    }

    this.getColumnList(this.componentUrl);

    const columnsArray = this.componentForm.get('columns') as FormArray;
    const libraryPathGroup = columnsArray.controls.find(group => group.get('name')?.value === 'Library Path');
    if (libraryPathGroup) {
      this.libraryPathListFilter.setValue(libraryPathGroup.get('property')?.value);
    }
    const footprintPathGroup = columnsArray.controls.find(group => group.get('name')?.value === 'Footprint Path');
    if (footprintPathGroup) {
      this.footprintPathListFilter.setValue(footprintPathGroup.get('property')?.value);
    }
  
    this.getComponents(this.componentFilter.value);
    this.componentListFilterChange();
    this.typeOfComponentListFilterChange();
    this.libraryPathListFilterChange();
    this.footprintPathListFilterChange();
    this.cdr.detectChanges();
  }
  

  getComponents(body?: IComponentsFolderOneRequest){
    this.componentService.getComponentsFolderOne(body).subscribe(result => {
      this.componentList = result.component_list || [];
      this.cdr.detectChanges();
      if (this.componentUrl){
        this.getTypeOfComponent(this.componentTypeFilter.value);
        this.getColumnList(this.componentUrl);
      }
    })
  }

  getTypeOfComponent(body: IComponentsFolderOneRequest){
    this.componentService.getComponentsFolderTwo(this.componentUrl, body).subscribe( result => {
      this.typeOfComponentList = result.component_list || [];
      this.cdr.detectChanges();
      if (this.typeOfComponentUrl){
        this.getPcbAndSchList();
      }
    })
  }
  getPcbAndSchList(body?: any){
    this.componentService.getComponentsFolderThree(this.componentUrl,this.typeOfComponentUrl,this.pcb_and_sch_filters.value).subscribe( result => {
      this.libraryPathOptions = result.SCH || []; 
      this.footprintPathOptions = result.PCB || []; 
    })
  }
  
  openSnackBar(text: string) {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: text,
      duration: 3000,
    });
  }

  onComponentSelected(name: IComponentsFolderOne){
    this.componentFilter.patchValue({
      name_filter: name.name
    })
    this.componentUrl= name.name || '';
  }

  clearComponentListFilter(){
    this.componentFilter.patchValue({
      name_filter: ''
    })
    this.componentUrl = ''
  }

  onLibraryPathSelected(data: any){

  }
  onFootprintPathSelected(data: any){
    
  }

  onTypeOfComponentSelected(name: IComponentsFolderOne){
    this.componentTypeFilter.patchValue({
      name_filter: name.name
    })
    this.typeOfComponentUrl = name.name || '';
  }

  clearTypeOfComponentListFilter(){
    this.componentTypeFilter.patchValue({
      name_filter: ''
    })
    this.typeOfComponentUrl = ''
  }
  
  componentListFilterChange(){
    this.componentFilter.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.getComponents(this.componentFilter.value);
    })
    this.componentListFilter.valueChanges.subscribe(() =>{
      this.componentFilter.patchValue({
        name_filter: this.componentListFilter.value
      })
    })
  }

  libraryPathListFilterChange() {
    this.pcb_and_sch_filters.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.getPcbAndSchList(this.pcb_and_sch_filters.value);
    });
  
    this.libraryPathListFilter.valueChanges.subscribe(value => {
      this.pcb_and_sch_filters.patchValue({
        sch_name_filter: value
      });
      this.updateColumnValue('Library Path', value); 
    });
  }
  
  footprintPathListFilterChange() {
    this.pcb_and_sch_filters.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.getPcbAndSchList(this.pcb_and_sch_filters.value);
    });
  
    this.footprintPathListFilter.valueChanges.subscribe(value => {
      this.pcb_and_sch_filters.patchValue({
        pcb_name_filter: value
      });
      this.updateColumnValue('Footprint Path', value); 
    });
  }

  updateColumnValue(columnName: string, value: string) {
    const columnsArray = this.componentForm.get('columns') as FormArray;
    const columnGroup = columnsArray.controls.find(column => column.get('name')?.value === columnName);
    
    if (columnGroup) {
      columnGroup.get('property')?.setValue(value);
    }
  }
  


  typeOfComponentListFilterChange(){
  this.componentTypeFilter.valueChanges.pipe(debounceTime(300)).subscribe(() => {
    this.getTypeOfComponent(this.componentTypeFilter.value);
  })
  this.typeOfComponentListFilter.valueChanges.subscribe(() =>{
    this.componentTypeFilter.patchValue({
      name_filter: this.typeOfComponentListFilter.value
    })
  })
}
  get columns(): FormArray {
    return this.componentForm.get('columns') as FormArray;
  }

  getColumnList(tableName?: string) {
    if (this.data) {
      const keys = Object.keys(this.data).filter(key => key !== 'id');

      const desiredOrder = ["Part Number", "Library Path", "Library Ref", "Footprint Path", "Footprint Ref"];
      keys.sort((a, b) => {
        const indexA = desiredOrder.indexOf(a);
        const indexB = desiredOrder.indexOf(b);
        
        if (indexA === -1 && indexB === -1) {
          return a.localeCompare(b);
        }
        if (indexA === -1) {
          return 1;
        }
        if (indexB === -1) {
          return -1;
        }
        return indexA - indexB;
      });
      
      const columns = this.componentForm.get('columns') as FormArray;
      columns.clear();
  
      keys.forEach(key => {
        columns.push(this.fb.group({
          name: [key],
          property: [this.data[key] || '']
        }));
      });
  
      this.cdr.detectChanges();
      return;
    }


    this.componentService.getColumns(tableName, { name_filter: "", limit: 10, offset: 0 }).subscribe(result => {
      const desiredOrder = ["Library Path", "Footprint Path", "Part Number","Library Ref","Footprint Ref"];
      const filteredResult = result.filter((col: any) => col.column !== 'id');
      filteredResult.sort((a: any, b: any) => {
        const indexA = desiredOrder.indexOf(a.column);
        const indexB = desiredOrder.indexOf(b.column);
  
        if (indexA === -1 && indexB === -1) {
          return 0;
        } else if (indexA === -1) {
          return 1;
        } else if (indexB === -1) {
          return -1;
        } else {
          return indexA - indexB;
        }
      });
  
      const columns = this.componentForm.get('columns') as FormArray;
      columns.clear();
  
      filteredResult.forEach((col: any) => {
        let defaultValue = '';
        if (col.column === 'Library Ref') {
          defaultValue = 'SCH';
        } else if (col.column === 'Footprint Ref') {
          defaultValue = 'PCB';
        }
        columns.push(this.fb.group({
          name: [col.column],
          property: [this.data ? (this.data[col.column] || '') : defaultValue]
        }));
      });
  
      this.cdr.detectChanges();
    });
  }
  
  
  
  updateDataComponent(data: Record<string, string>){
    this.componentService.updateComponent(data, this.componentUrl).subscribe({
      next: () => {
         this.openSnackBar('Компонент обновлен');
        this.dialogRef.close();
      },
      error: (error) => {
         this.openSnackBar('Ошибка при сохранении компонента ' + `${error.status}` + ". Попробуйте снова.");
      }});
  }

  
  onComponentFormClose() {
    const transformedData = this.transformColumnsToObject(this.componentForm.value.columns);
  
    if (this.componentForm.value.id) {
      transformedData['id'] = this.componentForm.value.id;
      this.updateDataComponent(transformedData);
    } else {
      this.postDataComponent(transformedData);
    }
  }

  postDataComponent(data: Record<string, string>){
    this.componentService.createComponent(data, this.componentUrl).subscribe({
      next: () => {
        this.openSnackBar('Компонент создан');
        this.dialogRef.close();
      },
      error: (error) => {
        this.openSnackBar('Не получилось сохранить компонент. ' + `${error.status}` + ". Попробуйте снова.")
      }});
  }

  transformColumnsToObject(columns: { name: string; property: string }[]): Record<string, string> {
    return columns.reduce((acc, col) => {
      acc[col.name] = col.property || ""; 
      return acc;
    }, {} as Record<string, string>);
  }
}
