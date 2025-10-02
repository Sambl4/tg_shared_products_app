import { Component, computed, inject, input, Input, OnInit, Signal, signal } from '@angular/core';
import { IProduct, IProductCategory, ProductService } from '../../services/product.service';
import { RouterLink } from '@angular/router';
import { ProductListComponent } from '../../components/product-list.component/product-list.component';
import { NgClass } from '@angular/common';
import { IconComponent } from '../../components/icons/icons.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [RouterLink, NgClass, ProductListComponent, IconComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {
  // @Input() category: IProductCategory = { category: '', id: 0, products: [] };
  @Input() categoryName: string = '';
  // @Input() categoryId: string = '';
  @Input() products: IProduct[] = [];
  categoryId = input<string>();
  // isRequiredProductList = input.required<boolean>();
  private productService = inject(ProductService);
  isCategoryOpened = false;
  selectedCategoryId = signal('');
  // categoryProducts = computed(() => {
  //   return this.productService.products()
  //     .filter((product: IProduct) => product.order === +this.selectedCategoryId())
  //     .filter((product: IProduct) => this.isRequiredProductList() ? !product.isDone : true);
  // });
  emptyListMsg = 'category is empty';

  ngOnInit(): void {
    this.selectedCategoryId.set(this.categoryId()!);
  }

  toggleCategory() {
    this.isCategoryOpened = !this.isCategoryOpened;
  }
}
