import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultComponent } from './dashboards/default/default.component';
import { AboutsComponent } from './abouts/abouts.component';
import { CategoriesComponent } from './categories/categories.component';
import { ProductsComponent } from './products/products.component';
import { FilesComponent } from './files/files.component';
import { authGuard } from '../core/guards/common/auth.guard';

const routes: Routes = [
  // { path: '', redirectTo: 'dashboard' },
  {
    path: "",
    component: DefaultComponent,
    canActivate:[authGuard]
  },
  { path: 'dashboard', component: DefaultComponent, canActivate:[authGuard] },
  { path: 'dashboards', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule), canActivate:[authGuard] },
  { path: 'hakkimizda', component:AboutsComponent, canActivate:[authGuard] },
  { path: 'kategoriler', component:CategoriesComponent, canActivate:[authGuard] },
  { path: 'urunler', component:ProductsComponent, canActivate:[authGuard] },
  { path: 'dosyalar', component:FilesComponent, canActivate:[authGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
