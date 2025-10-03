import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { ProductComponent } from './pages/product/product.component';
import { CategoryComponent } from './pages/category/category.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full' },
    { path: 'products', component: MainComponent },
    { path: 'feedback', component: FeedbackComponent },
    { path: 'category/:id', component: CategoryComponent },
    { path: 'product/:id', component: ProductComponent },
];
