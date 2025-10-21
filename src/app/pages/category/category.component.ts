import { Component, computed, inject, input, Input, OnInit, Signal, signal } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { RouterLink } from '@angular/router';
import { ProductListComponent } from '../../components/product-list.component/product-list.component';
import { NgClass } from '@angular/common';
import { IconComponent } from '../../components/icons/icons.component';
import { AppRoutes } from '../../app.routes';
import { IProduct } from '../../stores/with-products.store';
import { AppStore } from '../../stores/app.store';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [RouterLink, NgClass, ProductListComponent, IconComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {
  @Input() categoryName: string = '';
  @Input() products: IProduct[] = [];
  categoryId = input<string>();
  categoryRouterPath = `${AppRoutes.CATEGORIES}/${AppRoutes.CATEGORY}`;
  private _productService = inject(ProductService);
  private _appStore = inject(AppStore);
  isCategoryOpened = false;
  selectedCategoryId = signal('');
  emptyListMsg = 'category is empty';

  ngOnInit(): void {
    this.selectedCategoryId.set(this.categoryId()!);
  }

  toggleCategory() {
    this.isCategoryOpened = !this.isCategoryOpened;
  }
}
