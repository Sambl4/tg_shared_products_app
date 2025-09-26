import { Component, computed, effect, inject, model, OnDestroy, OnInit, resource, Signal, signal } from '@angular/core';
import { TelegramService } from '../../services/telegram.service';
import { IProduct, IProductCategory, ProductService, TProductCategory } from '../../services/product.service';
import { Router } from '@angular/router';
import { CategoryComponent } from '../category/category.component';
import { IconComponent } from '../../components/icons/icons.component';
import { TogglerComponent } from '../../components/toggler/toggler.component';
import { NgClass } from '@angular/common';
import { ProductListComponent } from '../../components/product-list.component/product-list.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    NgClass,
    CategoryComponent,
    IconComponent,
    ProductListComponent,
    TogglerComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit, OnDestroy {
  telegram = inject(TelegramService);
  productService = inject(ProductService);
  productCategories: Signal<{id: string, category: string, isHidden: boolean }[]> = computed(() => {
    const categories = this.productService.getProductsCategories();
    return Object
      .entries(categories)
      .map(([id, category]) => ({ id, category, isHidden: this.filteredCategories()[id] || false }))
  });
  draftProductCount = this.productService.draftProductCount;
  searchTermProducts = computed(() => {
return this.productService.products()
      .filter((product: IProduct) => product.title
        .includes(this.searchTerm())
        //  && product.isDone === this.isRequiredProductList()
      );
  });

  isFilterPanel = false;
  emptyListMsg = 'No products found';
  isRequiredProductList = signal(true);
  searchTerm = model('');
  private filteredCategories = signal<Record<string, boolean>>({});

  constructor(
    private router: Router,
  ) {
    this.telegram.MainButton.setText('show gas');
    this.telegram.MainButton.show();
    this.showData = this.showData.bind(this);

    effect(() => {
      this.searchTermProducts();
      this.isFilterPanel = false;
      ;
    });
  }

  ngOnInit(): void {
    this.telegram.MainButton.onClick(() => this.showData);
  }

  ngOnDestroy(): void {
    this.telegram.MainButton.offClick(() => this.showData);
  }

  goToFeedback() {
    this.router.navigate(['/feedback']);
  }

  callGas() {
    console.log();
    this.showData();
  }

  callSpreadsheet() {
    console.log('');
  }

  toggleFilterPanel() {
    this.isFilterPanel = !this.isFilterPanel;
  }

  onRequiredTogglerChanged(event: boolean) {
    this.isRequiredProductList.update(() => event)
  }

  onFilterCategory(id: string) {
    this.filteredCategories.update((current) => {
      return { ...current, [id]: !current[id] || false };
    });
  }

  onResetFilter() {
    this.filteredCategories.set({});
  }

  updateDraftProducts() {
    console.log('Update draft products');
  }

  private showData() {
  }
}
