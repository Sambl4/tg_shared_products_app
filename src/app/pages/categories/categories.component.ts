import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { SearchComponent } from '../../components/search/search.component';
import { AppStore } from '../../stores/app.store';
import { AppRoutes } from '../../app.routes';
import { IconComponent } from '../../components/icons/icons.component';

@Component({
  selector: 'app-categories.component',
  standalone: true,
  imports: [
    RouterOutlet,
    SearchComponent,
    IconComponent,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _appStore = inject(AppStore);

  searchTerm = signal('');

  emptyListMsg = 'Category not found';

  isEditMode = !!this._route.snapshot.firstChild?.paramMap.get('id');

  private categoriesMap = Object.entries(this._appStore.productCategoryIdToNameMap());
  categoryList = computed(() => 
    this.categoriesMap.filter(([_id, name]) => name.toLowerCase().includes(this.searchTerm().toLowerCase()))
  ) 

  onSelectCategory(categoryId: string) {
    this._router.navigate([AppRoutes.CATEGORIES, AppRoutes.CATEGORY, categoryId]);
    this.isEditMode = true;
  }

  onCancel() {
    this.searchTerm.set('');
  }

  onCloseEditMode() {
    this.isEditMode = false;
  }
}
