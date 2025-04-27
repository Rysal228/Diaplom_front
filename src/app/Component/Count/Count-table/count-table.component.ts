import { ChangeDetectorRef, Component, HostListener, OnInit, ViewEncapsulation } from "@angular/core";
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { CommonModule } from "@angular/common";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { StorageService } from "../../../Services/storage.service";
import { MatButtonModule } from "@angular/material/button";
import { ActivatedRoute } from "@angular/router";


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
    MatButtonModule,
    MatTableModule,
    CommonModule
  ]
})
export class CountTableComponent implements OnInit {
    
  constructor(
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
    private route: ActivatedRoute
  )
   {
    
   }

  archiveName: string | null = null;
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const name = params.get('archiveName');
      if (name) {
        this.archiveName = name;
        this.loadArchiveFromStorage(name);
      }
    });
  }
  isFloating = false;
  items = Array(100).fill(0);

  // для плавающей кнопки сохранить
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    this.isFloating = scrollY > 300; 
  }
  // для удаления архивов из localstorage
  @HostListener('window:beforeunload', ['$event'])
  clearArchiveOnClose(event: Event) {
    if (this.archiveName) {
      localStorage.removeItem(`zip_${this.archiveName}`);
    }
  }
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

  // async onFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (!input.files || !input.files.length) {
  //     return;
  //   }
  //   const file = input.files[0];
  //   this.processFile(file);
  // }
  async onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const baseName = file.name.replace(/\.[^/.]+$/, ''); // без расширения

    // 1) Считываем в ArrayBuffer
    const buf = await file.arrayBuffer();

    // 2) Конвертим в Base64
    const b64 = this.arrayBufferToBase64(buf);

    // 3) Сохраняем в localStorage
    localStorage.setItem(`zip_${baseName}`, b64);

    // 4) Открываем новую вкладку
    window.open(`/count/${baseName}`, '_blank');
  }
  get isRole(): string {
    return this.storageService.getUserRole();
  }
  async onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer?.files || !event.dataTransfer.files.length) {
      return;
    }
    const file = event.dataTransfer.files[0];
    this.processFile(file);
  }
  private arrayBufferToBase64(buf: ArrayBuffer) {
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i=0; i<bytes.byteLength; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    return btoa(bin);
  }
  
  private async loadArchiveFromStorage(name: string) {
    // Восстанавливаем имя архива
    this.originalFileName = `${name}.zip`;
  
    const b64 = localStorage.getItem(`zip_${name}`);
    if (!b64) {
      console.error(`Нет данных для архива ${name}`);
      return;
    }
    const buf = this.base64ToArrayBuffer(b64);
    await this.processArrayBuffer(buf, name);
    this.cdr.detectChanges();
  }

  private async processArrayBuffer(arrayBuffer: ArrayBuffer, fileName: string) {
    try {
      this.originalZip = await JSZip.loadAsync(arrayBuffer);

      // … ваш существующий код чтения .xlsx и группировки …
      // например:
      let excelFound = false;
      for (const fn in this.originalZip.files) {
        const entry = this.originalZip.files[fn];
        if (!entry.dir && !excelFound && fn.toLowerCase().endsWith('.xlsx')) {
          const data = await entry.async('arraybuffer');
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const requiredColumns = ['Part Number','Value','Comment','Description','Quantity','MarketURL','Price'];
          const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
          const headers = raw[0] as string[];
          this.tableHeaders = requiredColumns;
          this.tableData = raw.slice(1).map(row => {
            const obj: any = {};
            requiredColumns.forEach(col => {
              const idx = headers.indexOf(col);
              obj[col] = idx >= 0 ? row[idx] : null;
            });
            return obj;
          });
          excelFound = true;
        }
      }
      // группировка и подсчёты (как у вас)
      this.groupedTableData = this.tableData.reduce((acc, r) => {
        const key = r['MarketURL']||'Без MarketURL';
        (acc[key] = acc[key]||[]).push(r);
        return acc;
      }, {} as any);
      Object.keys(this.groupedTableData).forEach(m => {
        this.groupTotals[m] = this.groupedTableData[m]
          .reduce((s, r) => s + Number(r.Price||0)*Number(r.Quantity||0), 0);
      });
      this.overallTotal = Object.values(this.groupTotals)
        .reduce((s, v) => s+v, 0);
    } catch(err) {
      console.error('Ошибка распаковки', err);
    }
  }

  /** Base64 → ArrayBuffer */
  private base64ToArrayBuffer(b64: string) {
    const bin = atob(b64);
    const buf = new ArrayBuffer(bin.length);
    const bytes = new Uint8Array(buf);
    for (let i=0; i<bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return buf;
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