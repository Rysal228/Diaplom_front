import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from "@angular/core";
import JSZip from 'jszip';
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
  encapsulation: ViewEncapsulation.None,
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
  // Список файлов из архива
  files: Array<{ name: string, content: string }> = [];
  // Данные для таблицы из Excel
  tableData: any[] = [];
  // Заголовки для таблицы
  tableHeaders: string[] = [];
  // Группированные данные по MarketURL
  groupedTableData: { [key: string]: any[] } = {};
  // Суммы по каждому MarketURL
  groupTotals: { [key: string]: number } = {};
  // Общая сумма по всем магазинам
  overallTotal: number = 0;
  // Сохраняем исходный архив, чтобы потом можно было его модифицировать
  originalZip: JSZip | null = null;
  originalFileName: string = '';
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

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
      this.originalFileName = file.name;
      try {
        const arrayBuffer = data as ArrayBuffer;
        // Загружаем архив и сохраняем его для дальнейшей модификации
        this.originalZip = await JSZip.loadAsync(arrayBuffer);
        // Сброс предыдущих данных
        this.files = [];
        this.tableData = [];
        this.tableHeaders = [];
        this.groupedTableData = {};
        this.groupTotals = {};
        this.overallTotal = 0;

        let excelFound = false;
        for (const fileName in this.originalZip.files) {
          const zipEntry = this.originalZip.files[fileName];
          if (!zipEntry.dir) {
            // Добавляем имя файла в список
            this.files.push({ name: fileName, content: '' });
            // Если найден Excel (.xlsx)
            if (!excelFound && fileName.toLowerCase().endsWith('.xlsx')) {
              console.log(`Читаем файл: ${fileName}`);
              const excelData = await zipEntry.async('arraybuffer');
              // Чтение книги Excel
              const workbook = XLSX.read(excelData, { type: 'array' });
              console.log('Листы в файле:', workbook.SheetNames);
              // Берем первый лист
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              // Указываем необходимые колонки (Price переименовали из Price1)
              const requiredColumns = ['Part Number','Value','Comment','Description','Quantity', 'MarketURL', 'Price'];
              // Чтение данных листа в виде массива массивов
              const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              console.log(`Содержимое листа ${sheetName}:`, jsonData);
              if (jsonData.length) {
                const headers = jsonData[0] as string[];
                // Преобразуем данные в массив объектов с нужными колонками
                this.tableData = jsonData.slice(1).map(row => {
                  const obj: any = {};
                  requiredColumns.forEach(col => {
                    const index = headers.indexOf(col);
                    obj[col] = index !== -1 ? row[index] : null;
                  });
                  return obj;
                });
                this.tableHeaders = requiredColumns;
              }
              excelFound = true;
            }
          }
        }
        // Группируем данные по MarketURL
        this.groupedTableData = this.tableData.reduce((acc: { [key: string]: any[] }, row: any) => {
          const key = row['MarketURL'] || 'Без MarketURL';
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(row);
          return acc;
        }, {});

        // Вычисляем сумму Price для каждой группы
        Object.keys(this.groupedTableData).forEach((market) => {
          let sum = 0;
          this.groupedTableData[market].forEach(row => {
            const price = Number(row['Price'] || 0);
            const quantity = Number(row['Quantity'] || 0);
            sum += price * quantity;
          });
          this.groupTotals[market] = sum;
        });
        // Вычисляем общую сумму по всем группам
        this.overallTotal = Object.values(this.groupTotals).reduce((total, curr) => total + curr, 0);

        this.cdr.detectChanges();
      } catch (error) {
        console.error('Ошибка при распаковке файла', error);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async onDownloadArchives() {
    if (!this.originalZip) {
      console.error('Архив не загружен');
      return;
    }
    if (!this.originalFileName) {
      console.error('Имя загруженного архива неизвестно');
      return;
    }
  
    // Определяем список файлов и, при наличии, корневую папку (например, "DC")
    const fileNames = Object.keys(this.originalZip.files);
    let rootFolderName = "";
    const firstWithSlash = fileNames.find(fn => fn.includes("/"));
    if (firstWithSlash) {
      const parts = firstWithSlash.split("/");
      if (parts.length > 0) {
        rootFolderName = parts[0];
      }
    }
    
    // Задаём пути для папок BOM, Gerber и NC Drill
    const bomPath = rootFolderName ? `${rootFolderName}/BOM` : "BOM";
    const gerberPath = rootFolderName ? `${rootFolderName}/Gerber` : "Gerber";
  
    // Создаем два отдельных архива
    const bomZip = new JSZip();
    const pcbZip = new JSZip();
  
    // Обрабатываем файлы для PCB-архива, применяя нужные условия исключения
    const pcbFilePromises = fileNames.map(async (fileName) => {
      const fileObj = this.originalZip!.files[fileName];
  
      // Пропускаем каталоги
      if (fileObj.dir) {
        return;
      }
  
      // Исключаем файлы, находящиеся в папке BOM (они не нужны для PCB)
      if (fileName.startsWith(bomPath + "/")) {
        return;
      }
  
      // Обработка файлов из папки NC Drill:
      // Если это файл с расширением .txt – перемещаем его в PCB (на корневой уровень)
      if (fileName.includes("/NC Drill/")) {
        if (!fileName.toLowerCase().endsWith(".txt")) {
          return;
        } else {
          const content = await fileObj.async("arraybuffer");
          const parts = fileName.split("/");
          const newFileName = parts[parts.length - 1]; // берём только имя файла
          pcbZip.file(newFileName, content);
          return;
        }
      }
  
      // Обработка файлов из папки Gerber:
      // Исключаем файлы с нежелательными расширениями
      if (fileName.startsWith(gerberPath + "/")) {
        if (
          fileName.endsWith(".APR_LIB") ||
          fileName.endsWith(".EXTREP") ||
          fileName.endsWith(".REP") ||
          fileName.endsWith(".apr")
        ) {
          return;
        }
        // Убираем префикс папки, чтобы в архиве они находились на корневом уровне
        const newFileName = fileName.substring((gerberPath + "/").length);
        const content = await fileObj.async("arraybuffer");
        pcbZip.file(newFileName, content);
        return;
      }
  
      // Если файл не попадает под вышеперечисленные условия, можно по необходимости добавить иные обработки
      // Например, можно сохранить его в PCB без изменений:
      const content = await fileObj.async("arraybuffer");
      pcbZip.file(fileName, content);
    });
    await Promise.all(pcbFilePromises);
  
    // Для BOM-архива генерируем Excel-файлы для каждой группы MarketURL.
    // Эти файлы будут помещены в корень архива BOM.
    Object.keys(this.groupedTableData).forEach((marketURL) => {
      if (!this.groupedTableData[marketURL].length) return; // пропускаем пустые группы
  
      const sheetData = [
        this.tableHeaders,
        ...this.groupedTableData[marketURL].map(row =>
          this.tableHeaders.map(header => row[header] ?? "")
        )
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  
      // Генерируем бинарные данные Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
  
      const s2ab = (s: string) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
          view[i] = s.charCodeAt(i) & 0xff;
        }
        return view;
      };
  
      // Очищаем имя от запрещённых символов и добавляем расширение .xlsx
      const safeFileName = marketURL.replace(/[\/:*?"<>|]/g, "_") + ".xlsx";
      bomZip.file(safeFileName, s2ab(excelBuffer), { binary: true });
    });
  
    // Получаем базовое имя исходного архива без расширения
    const baseName = this.originalFileName.split('.').slice(0, -1).join('.') || this.originalFileName;
  
    // Генерируем и скачиваем BOM-архив
    bomZip.generateAsync({ type: "blob" }).then((content: Blob) => {
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}_BOM.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  
    // Генерируем и скачиваем PCB-архив
    pcbZip.generateAsync({ type: "blob" }).then((content: Blob) => {
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}_PCB.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }
  
}  