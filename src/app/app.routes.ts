import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
    //{ path: "", redirectTo: 'resistors', pathMatch: 'full'},
    { path: "elementsBar", loadComponent: () => import ('./Component/Elements/elements-table.component').then(c => c.ElementsTableComponent)},
    { path: "resistors", loadComponent: () => import ('./Component/Elements/Resistors/Resistors-table/resistors-table.component').then(c => c.ResistorsTableComponent)},
    { path: "transistors", loadComponent: () => import ('./Component/Elements/Transistors/Transistors-table/transistors-table.component').then(c => c.TransistorsTableComponent)},
    { path: "count", loadComponent: () => import ('./Component/Count/Count-table/count-table.component').then(c => c.CountTableComponent)},
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
    exports: [RouterModule]
})
export class AppRoutes {
 }