import { Component, Inject, OnInit } from '@angular/core';
import { ComponentService } from '../../../../Services/component.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { ConfirmDialogCreateComponent } from '../../../confirm-dialog-create/confirm-dialog-create.component';
import { StorageService } from '../../../../Services/storage.service';
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
    MatIconModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatTooltipModule
  ]
})
export class ComponentModalComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private componentService: ComponentService,
    private dialogRef: MatDialogRef<ComponentModalComponent>,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.componentForm = this.fb.group({
      id: [null],
      columns: this.fb.array([]),
    });
  }

  get isRole(): string {
    return this.storageService.getUserRole();
  }
  component!: any;
  componentForm: FormGroup;
  
  componentUrl: string = '';
  typeOfComponentUrl: string = '';
  checkComponentPartCopy: boolean = false;

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
    if (this.data.component) {
      this.component = { ...this.data.component };
      this.componentForm.patchValue({
        id: this.data.component.id
      });
      this.componentListFilter.disable();
      // this.componentUrl = this.component.tableUrl || '';
      // this.componentListFilter.setValue(this.componentUrl);
      
    }
    
    this.getColumnList(this.componentUrl);
    this.initializationData();
    this.getComponents(this.componentFilter.value);
    
    this.componentListFilterChange();
    this.typeOfComponentListFilterChange();
    this.libraryPathListFilterChange();
    this.footprintPathListFilterChange();
    this.cdr.detectChanges();
  }
  
  initializationData(){
    if (this.data.tableListFilter){
      this.componentListFilter.setValue(this.data.tableListFilter);
      this.componentFilter.patchValue({
          name_filter: this.componentListFilter.value
      })
      this.componentUrl= this.componentListFilter.value
    }
    const columnsArray = this.componentForm.get('columns') as FormArray;
    const libraryPathGroup = columnsArray.controls.find(group => group.get('name')?.value === 'Library Path');
    if (libraryPathGroup) {
      this.libraryPathListFilter.setValue(libraryPathGroup.get('property')?.value);
    }
    const footprintPathGroup = columnsArray.controls.find(group => group.get('name')?.value === 'Footprint Path');
    if (footprintPathGroup) {
      this.footprintPathListFilter.setValue(footprintPathGroup.get('property')?.value);
    }
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
    const requiredColumns = ["Part Number", "Footprint Ref", "Footprint Path", "Library Ref", "Library Path"];
    if (this.data.component) {
      
      // Получаем все ключи, исключая id
      let keys = Object.keys(this.data.component).filter(key => key !== 'id');
  
      // Определяем колонки, которые должны всегда быть последними
      const specialColumns = ['Library Ref', 'Footprint Ref'];
  
      // Разбиваем ключи на две группы
      const specialKeys = keys.filter(key => specialColumns.includes(key));
      const otherKeys = keys.filter(key => !specialColumns.includes(key));
  
      // Отсортировать обычные колонки по нужному порядку (или алфавитном порядке)
      // Например, можно задать массив желаемого порядка для остальных колонок:
      const desiredOrder = ["Library Path", "Footprint Path", "Part Number"];
      otherKeys.sort((a, b) => {
        const indexA = desiredOrder.indexOf(a);
        const indexB = desiredOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) {
          return -1;
        }
        if (indexB !== -1) {
          return 1;
        }
        return a.localeCompare(b);
      });
  
      // Если нужен определённый порядок для специальных колонок, задаём его
      const specialDesiredOrder = ['Library Ref', 'Footprint Ref'];
      specialKeys.sort((a, b) => specialDesiredOrder.indexOf(a) - specialDesiredOrder.indexOf(b));
  
      // Объединяем обычные и специальные колонки так, чтобы специальные были в конце
      keys = [...otherKeys, ...specialKeys];
  
      // Заполняем FormArray
      const columns = this.componentForm.get('columns') as FormArray;
      columns.clear();
      keys.forEach(key => {
        const isRequired = requiredColumns.includes(key);
  
        columns.push(this.fb.group({
          name: [key, isRequired ? Validators.required : []], 
          // property: [this.data.component[key] || '', isRequired ? Validators.required : []] 
          property: [
            { value: this.data.component[key] || '', disabled: key === 'Price' },
            isRequired ? Validators.required : []
          ]
        }));
      });
  
      this.cdr.detectChanges();
      return;
    }
  
    // Если this.data.component отсутствует, аналогичным образом обработать результат с сервера:
    this.componentService.getColumns(tableName, { name_filter: "", limit: 10, offset: 0 }).subscribe(result => {
      // Определяем массив специального порядка
      const specialColumns = ['Library Ref', 'Footprint Ref'];
      const desiredOrder = ["Library Path", "Footprint Path", "Part Number"]; // для остальных
  
      // Фильтруем результат, исключая поле id
      const filteredResult = result.filter((col: any) => col.column !== 'id');
  
      // Разбиваем на две группы
      const specialResults = filteredResult.filter((col: any) => specialColumns.includes(col.column));
      const otherResults = filteredResult.filter((col: any) => !specialColumns.includes(col.column));
  
      // Сортируем обычные поля
      otherResults.sort((a: any, b: any) => {
        const indexA = desiredOrder.indexOf(a.column);
        const indexB = desiredOrder.indexOf(b.column);
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) {
          return -1;
        }
        if (indexB !== -1) {
          return 1;
        }
        return a.column.localeCompare(b.column);
      });
  
      // При необходимости можно отсортировать специальные поля по своему порядку:
      const specialDesiredOrder = ['Library Ref', 'Footprint Ref'];
      specialResults.sort((a: any, b: any) => specialDesiredOrder.indexOf(a.column) - specialDesiredOrder.indexOf(b.column));
  
      // Объединяем массивы, чтобы специальные поля были в конце
      const finalColumns = [...otherResults, ...specialResults];
  
      const columns = this.componentForm.get('columns') as FormArray;
      columns.clear();
      finalColumns.forEach((col: any) => {
        let defaultValue = '';
        if (col.column === 'Library Ref') {
          defaultValue = 'SCH';
        } else if (col.column === 'Footprint Ref') {
          defaultValue = 'PCB';
        }

        const isRequired = requiredColumns.includes(col.column);

        columns.push(this.fb.group({
          name: [col.column, isRequired ? Validators.required : []],
          // property: [this.data.component ? (this.data.component[col.column] || '') : defaultValue, isRequired ? Validators.required : []]
          property: [{
            value: this.data.component ? (this.data.component[col.column] || '') : defaultValue,
            disabled: col.column === 'Price'
          }, isRequired ? Validators.required : []]
          
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

  
  // onComponentSaveForm() {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     data: 'Вы точно хотите сохранить эту запись?'
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       const transformedData = this.transformColumnsToObject(this.componentForm.value.columns);
  //       if (this.componentForm.value.id) {
  //         transformedData['id'] = this.componentForm.value.id;
  //         this.updateDataComponent(transformedData);
  //       } else {
  //         this.postDataComponent(transformedData);
  //       }
  //     }
  //   });
  // }

  onComponentSaveForm() {
    const dialogRef = this.dialog.open(ConfirmDialogCreateComponent, {
      data: this.isCopyDisabled
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('res0:',result)
      // выбрали перзеаписать
      if (result === false) {
        // из-за price disabled
        // const transformedData = this.transformColumnsToObject(this.componentForm.value.columns);
        const transformedData = this.transformColumnsToObject(this.componentForm.getRawValue().columns);

        if (this.componentForm.value.id) {
          transformedData['id'] = this.componentForm.value.id;
          this.updateDataComponent(transformedData);
        } else {
          this.postDataComponent(transformedData);
        }
      }
      else if (result === true) {
        console.log('res',result)
        // выбрали создать
        this.onComponentCreateCopyForm();
      }
    });
  }
  get isCopyDisabled(): boolean {

    if (!this.data.component) {
      return false;
    }
    const columnsArray = this.componentForm.get('columns') as FormArray;
    const partNumberControl = columnsArray.controls.find(
      ctrl => ctrl.get('name')?.value === 'Part Number'
    );
    if (partNumberControl) {
      const currentPartNumber = partNumberControl.get('property')?.value;
      const originalPartNumber = this.data.component['Part Number'];

      return currentPartNumber === originalPartNumber;
    }
    return false;
  }
  
  onComponentCreateCopyForm(){
    // if (this.data.component) {
    //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    //     data: 'Вы точно хотите создать копию этой записи?'
    //   });

      // dialogRef.afterClosed().subscribe(result => {
        // if (result) {
          this.componentForm.patchValue({ id: null });
          const transformedData = this.transformColumnsToObject(this.componentForm.value.columns);
          this.postDataComponent(transformedData);
        // }
      // });
    // }
  }

  postDataComponent(data: Record<string, string>){
    this.componentService.createComponent(data, this.componentUrl).subscribe({
      next: () => {
        this.openSnackBar('Компонент создан');
        this.dialogRef.close();
      },
      error: (error) => {
        let message = `Не получилось сохранить компонент. ${error.status}. Попробуйте снова.`;
        if (error.error && error.error.detail) {
          message = error.error.detail;
        }
        this.openSnackBar(message);
      }});
  }

  transformColumnsToObject(columns: { name: string; property: string }[]): Record<string, string> {
    return columns.reduce((acc, col) => {
      acc[col.name] = col.property || ""; 
      return acc;
    }, {} as Record<string, string>);
  }
}
