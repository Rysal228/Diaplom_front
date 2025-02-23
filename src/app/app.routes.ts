import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './Component/auth-guard.component.ts/auth-guard.component';

export const routes: Routes = [
    { path: "", redirectTo: '/auth', pathMatch: 'full' },
    { path: "auth", loadComponent: () => import('./Component/auth/auth.component').then(c => c.AuthComponent) },
    { path: "elementsBar", loadComponent: () => import('./Component/Elements/elements-table.component').then(c => c.ElementsTableComponent), canActivate: [AuthGuard] },
    { path: "count", loadComponent: () => import('./Component/Count/Count-table/count-table.component').then(c => c.CountTableComponent), canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class AppRoutes { }
