import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import * as JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { CommonModule } from "@angular/common";
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
    MatTableModule,
    CommonModule
  ]
})
export class CountTableComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {}

  // Массив для вывода списка файлов (если нужен)
  files: Array<{ name: string, content: string }> = [];
  // Данные для отображения таблицы из Excel
  tableData: any[] = [];
  // Опционально: заголовки таблицы, если они есть
  tableHeaders: string[] = [];

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) {
      return;
    }
    const file = input.files[0];
    this.processFile(file);
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer?.files || !event.dataTransfer.files.length) {
      return;
    }
    const file = event.dataTransfer.files[0];
    this.processFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  private async processFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result;
      if (!data) {
        console.error('Пустой файл');
        return;
      }
      try {
        const arrayBuffer = data as ArrayBuffer;
        const zip = await JSZip.loadAsync(arrayBuffer);
        // Сброс списка файлов
        this.files = [];
        // Перебор файлов архива
        let excelFound = false;
        for (const fileName in zip.files) {
          const zipEntry = zip.files[fileName];
          if (!zipEntry.dir) {
            // Добавляем все файлы в массив (для примера)
            this.files.push({ name: fileName, content: '' });
            // Если файл имеет расширение .xlsx, обрабатываем его как Excel
            if (!excelFound && fileName.toLowerCase().endsWith('.xlsx')) {
              const excelData = await zipEntry.async('arraybuffer');
              // Чтение книги Excel
              const workbook = XLSX.read(excelData, { type: 'array' });
              // Берем первый лист
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              // Преобразуем лист в массив массивов (каждая строка – массив ячеек)
              const requiredColumns = ['Part Number','Value','Comment','Description','Quantity', 'MarketURL', 'Price1'];
              const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              if (jsonData.length) {
                const headers = jsonData[0] as string[];
                // Преобразуем данные в массив объектов, оставляя только нужные колонки
                this.tableData = jsonData.slice(1).map(row => {
                  const obj: any = {};
                  requiredColumns.forEach(col => {
                    // Находим индекс колонки в исходных заголовках
                    const index = headers.indexOf(col);
                    obj[col] = index !== -1 ? row[index] : null;
                  });
                  return obj;
                });
                // Используем нужные названия колонок
                this.tableHeaders = requiredColumns;
              }
              excelFound = true;
            }
          }
        }
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Ошибка при распаковке файла', error);
      }
    };
    reader.readAsArrayBuffer(file);
  }
}
