import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkTheme = false;

  constructor() {
    const storedTheme = localStorage.getItem('dark-theme');
    if (storedTheme === 'true') {
      this.darkTheme = true;
      document.body.classList.add('dark-theme');
    }
  }

  toggleTheme(): void {
    this.darkTheme = !this.darkTheme;
    if (this.darkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('dark-theme', this.darkTheme.toString());
  }

  isDarkTheme(): boolean {
    return this.darkTheme;
  }
}
