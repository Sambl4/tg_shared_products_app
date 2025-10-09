import { Component, computed, effect, inject, model, OnDestroy, OnInit, resource, Signal, signal } from '@angular/core';
import { TelegramService } from '../../services/telegram.service';
import { IProduct, IProductCategory, ProductService, ServiceMessageType, TProductCategory } from '../../services/product.service';
import { Router } from '@angular/router';
import { CategoryComponent } from '../category/category.component';
import { IconComponent } from '../../components/icons/icons.component';
import { TogglerComponent } from '../../components/toggler/toggler.component';
import { PopupComponent } from '../../components/popup/popup.component';
import { NgClass, SlicePipe } from '@angular/common';
import { ProductListComponent } from '../../components/product-list.component/product-list.component';
import { LoginService } from '../../services/login.service';
import { AppRoutes } from '../../app.routes';
import { HttpService, IPostPayload, PostMethods } from '../../services/http.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    NgClass,
    SlicePipe,
    CategoryComponent,
    IconComponent,
    ProductListComponent,
    TogglerComponent,
    PopupComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit, OnDestroy {
  telegram = inject(TelegramService);
  productService = inject(ProductService);
  loginService = inject(LoginService);
  httpService = inject(HttpService);
  productCategories: Signal<IProductCategory[]> = computed(() => {
    const categories = this.productService.getProductsCategories();
    const productsByCategory = this.productService.productsByCategory();

    if (!categories && !productsByCategory) {
      return [];
    }
    return Object
      .entries(categories)
      .map(([id, category]) => {
          const products = productsByCategory[id]
            .filter((product: IProduct) => this.isRequiredProductList() ? !product.isDone : true);

          return {
            id,
            category,
            products,
            isHidden: products.length === 0,
            isFiltered: !!this.filteredCategories()[id],
          };
      });
  });

  draftProductCount = this.productService.draftProductCount;
  searchTermProductsList = computed(() => this.productService.products()
    .filter((product: IProduct) => product.title.toLowerCase()
      .includes(this.searchTerm().toLowerCase())
    )
  );

  isDraftList = false;
  
  // Popup demo state
  isPopupOpen = signal(false);
  
  draftProductsList = computed(() => {
    const products = this.productService.products();
    return products.filter((prod) => prod.isDraft);
  });

  productsByCategory = computed(() => {
    return this.productService.productsByCategory();
      // .filter((product: IProduct) => product.order === +this.selectedCategoryId())
      // .filter((product: IProduct) => this.isRequiredProductList() ? !product.isDone : true);
  });
  productsByCategoryEntries = computed(() => {
    return Object.entries(this.productsByCategory());
  });

  isFilterPanel = false;
  isSearching = false;
  emptyListMsg = 'No products found';
  isRequiredProductList = signal(true);
  searchTerm = model('');
  private filteredCategories = signal<Record<string, boolean>>({});
  hasFilteredCategories = computed(() => Object.keys(this.filteredCategories()).length > 0);

  constructor(
    private router: Router,
  ) {
    this.telegram.MainButton.setText('Update');
    this.telegram.MainButton.show();
    // this.telegram.MainButton.disable();
    this.updateDraftProducts = this.updateDraftProducts.bind(this);

    effect(() => {
      this.searchTermProductsList();
      this.isFilterPanel = false;
    });

    effect(() => {
      const draftList = this.draftProductsList();
      if(this.isDraftList && !draftList.length) {
        this.isDraftList = false;
      }

      draftList.length ?
        this.telegram.MainButton.show() :
        this.telegram.MainButton.hide();
    })
  }

  ngOnInit(): void {
    this.productService.loadProducts();
    this.telegram.MainButton.onClick(() => this.updateDraftProducts());
  }

  ngOnDestroy(): void {
    this.telegram.MainButton.offClick(() => this.updateDraftProducts());
  }

  goToFeedback() {
    this.router.navigate([AppRoutes.FEEDBACK]);
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
    this.onResetFilter();
    this.isRequiredProductList.update(() => event);
  }

  onFilterCategory(id: string) {
    this.filteredCategories.update((current) => {
      return { ...current, [id]: current[id] ? !current[id] : true };
    });
  }

  onResetFilter() {
    this.filteredCategories.set({});
  }

  onDraftProductList() {
    this.isDraftList = !this.isDraftList;
    this.isFilterPanel = false;
  }

  onResetDraftState() {
    this.productService.resetDraftState();
  }

  // Popup demo methods
  openPopup() {
    this.isPopupOpen.set(true);
  }

  closePopup() {
    this.isPopupOpen.set(false);
  }

  logout() {
    this.loginService.logout();
  }

  notifyGroupMembers() {
    const user = this.loginService.currentUser();

    const payload: IPostPayload = {
      method: PostMethods.NOTIFY,
      body: {
          data: user,
          id: 'n/a'
      }
    };
    this.closePopup()

    this.httpService.post(payload).then(resp => {
      if(resp.ok) {
        this.productService.setServiceMessage(
          'Group members notified',
          ServiceMessageType.SUCCESS
        );
      }
    });
  }

  private updateDraftProducts() {
    this.productService.updateCartList();
  }

  private showData() {
  }
}
