import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { ProductsComponent } from './pages/products/products.component';
import { CategoryComponent } from './pages/category/category.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { EditCategoryComponent } from './pages/edit-category/edit-category.component';
import { CategoryListComponent } from './pages/categories-list/category-list.component';
import { PresetsListComponent } from './pages/presets-list/presets-list.component';
import { EditPresetComponent } from './pages/edit-preset/edit-preset.component';

export enum AppRoutes {
  EMPTY = '',
  LOGIN = 'login',
  EDIT = 'edit',
  PRODUCTS = 'products',
  FEEDBACK = 'feedback',
  CATEGORIES = 'categories',
  PRESETS = 'presets',
  PRESET = 'preset',
  CATEGORY = 'category',
  PRODUCT = 'product',
}

export const routes: Routes = [
  { path: AppRoutes.EMPTY, redirectTo: `${AppRoutes.LOGIN}`, pathMatch: 'full' },
  { path: `${AppRoutes.LOGIN}`, component: LoginComponent },
  { path: `${AppRoutes.PRODUCTS}`, component: MainComponent, canActivate: [authGuard] },
  {
    path: `${AppRoutes.EDIT}`,
    canActivate: [authGuard],
    children: [
      { 
        path: `${AppRoutes.CATEGORIES}`,
        component: CategoryListComponent, 
        canActivate: [authGuard],
        children: [
          { 
            path: `${AppRoutes.CATEGORY}/:id`,
            component: EditCategoryComponent,
            canActivate: [authGuard]
          },
        ],
      },{
        path: `${AppRoutes.PRESET}/:id`,
        component: EditPresetComponent,
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: `${AppRoutes.PRESETS}`,
    component: PresetsListComponent,
    canActivate: [authGuard],
  },
  { path: `${AppRoutes.FEEDBACK}`, component: FeedbackComponent, canActivate: [authGuard] },
  
  { path: `${AppRoutes.PRODUCT}/:id`, component: ProductsComponent, canActivate: [authGuard] },
];
