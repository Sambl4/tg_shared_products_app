import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { ProductsComponent } from './pages/products/products.component';
import { CategoryComponent } from './pages/category/category.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { EditCategoryComponent } from './pages/edit-category/edit-category.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { PresetsComponent } from './pages/presets/presets.component';

export enum AppRoutes {
  EMPTY = '',
  LOGIN = 'login',
  PRODUCTS = 'products',
  FEEDBACK = 'feedback',
  CATEGORIES = 'categories',
  PRESETS = 'presets',
  CATEGORY = 'category',
  PRODUCT = 'product',
}

export const routes: Routes = [
  { path: AppRoutes.EMPTY, redirectTo: `${AppRoutes.LOGIN}`, pathMatch: 'full' },
  { path: `${AppRoutes.LOGIN}`, component: LoginComponent },
  { path: `${AppRoutes.PRODUCTS}`, component: MainComponent, canActivate: [authGuard] },
  { 
    path: `${AppRoutes.CATEGORIES}`,
    component: CategoriesComponent, 
    canActivate: [authGuard],
    children: [
      { 
        path: `${AppRoutes.CATEGORY}/:id`,
        component: EditCategoryComponent,
        canActivate: [authGuard]
      },
    ]
  },
  { path: `${AppRoutes.PRESETS}`, component: PresetsComponent, canActivate: [authGuard] },
  { path: `${AppRoutes.FEEDBACK}`, component: FeedbackComponent, canActivate: [authGuard] },
  
  { path: `${AppRoutes.PRODUCT}/:id`, component: ProductsComponent, canActivate: [authGuard] },
];
