import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { ProductComponent } from './pages/product/product.component';
import { CategoryComponent } from './pages/category/category.component';

export const routes: Routes = [
    { path: '', component: MainComponent, pathMatch: 'full' },
    { path: 'feedback', component: FeedbackComponent },
    { path: 'category/:id', component: CategoryComponent },
    { path: 'product/:id', component: ProductComponent },
];
