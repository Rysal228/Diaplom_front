import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from '../src/app/app.component';
import { AppRoutes } from '../src/app/app.routes';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { JwtInterceptorProviders } from '../src/app/Component/interceptor/custom.interceptor';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginatorIntl } from '../src/app/Component/paginator/custom-paginator-intl.component';

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(AppRoutes,),
        {
            provide: MAT_DATE_LOCALE,
            useValue: 'ru-RU'
        },
        {
            provide: MatPaginatorIntl,
            useClass: CustomPaginatorIntl
        },
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: { panelClass: 'mat-dialog-override' }
        },
        JwtInterceptorProviders,
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()), provideAnimationsAsync()
    ]
})
    .catch(err => console.error(err));
