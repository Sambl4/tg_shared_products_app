import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TelegramService } from '../../services/telegram.service';
import { Router } from '@angular/router';
import { CategoryComponent } from '../category/category.component';
import { IconComponent } from '../../components/icons/icons.component';
import { TogglerComponent } from '../../components/toggler/toggler.component';
import { PopupComponent } from '../../components/popup/popup.component';
import { NgClass, SlicePipe } from '@angular/common';
import { ProductListComponent } from '../../components/product-list.component/product-list.component';
import { AppRoutes } from '../../app.routes';
import { HttpService, IPostPayload, PostMethods } from '../../services/http.service';
import { MessageService, ServiceMessageType } from '../../services/message.service';
import { AppStore } from '../../stores/app.store';
import { SearchComponent } from '../../components/search/search.component';

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
    SearchComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit, OnDestroy {
  private _telegram = inject(TelegramService);
  private _serviceMessage = inject(MessageService);
  private _router = inject(Router);
  private _httpService = inject(HttpService);
  appStore = inject(AppStore);

  // productCategories: Signal<IProductCategory[]> = this.appStore.productCategories;
  draftProductsList = this.appStore.draftProducts;
  searchTermProductsList = this.appStore.searchTermProductsList;

  isTgApp = this._telegram.getIsTgApp();
  isDraftList = false;  
  // Popup demo state
  isPopupOpen = signal(false);
  isSearching = false;
  emptyListMsg = 'No products found';
  isFilterPanel = false;
  hasFilteredCategories = computed(() => Object.keys(this.appStore.filteredCategories()).length > 0);

  constructor() {
    this._telegram.MainButton.setText('Update');
    this._telegram.MainButton.show();
    this.updateDraftProducts = this.updateDraftProducts.bind(this);

    effect(() => {
      const draftList = this.draftProductsList();
      if(this.isDraftList && !draftList.length) {
        this.isDraftList = false;
      }

      draftList.length ?
        this._telegram.MainButton.show() :
        this._telegram.MainButton.hide();
    });
  }

  ngOnInit(): void {
    if (this.appStore.productCategories.length === 0) {
      this.loadProducts();
    }
    this._telegram.MainButton.onClick(() => this.updateDraftProducts());
  }

  ngOnDestroy(): void {
    this._telegram.MainButton.offClick(() => this.updateDraftProducts());
  }
  
  loadProducts() {
    this.appStore.loadCachedProducts().then(res => {
      res ? this._serviceMessage.showMessage(
        'Cached Data',
        ServiceMessageType.INFO
      ) : this._serviceMessage.showMessage(
        'No Cached Data',
        ServiceMessageType.ERROR
      );
    });

    this.appStore.loadProducts();
  };

  goToFeedback() {
    this._router.navigate([AppRoutes.FEEDBACK]);
  }

  toggleFilterPanel() {
    this.isFilterPanel = !this.isFilterPanel;
  }

  onRequiredTogglerChanged(event: boolean) {
    this.onResetFilter();
    this.appStore.setIsRequiredProductList(event);
  }

  onFilterCategory(id: string) {
    this.appStore.filterByCategory(id);
  }

  onResetFilter() {
    this.appStore.resetCategoryFilter();
  }

  onDraftProductList() {
    this.isDraftList = !this.isDraftList;
    this.isFilterPanel = false;
  }

  onResetDraftState() {
    this.isDraftList = false;
    this.appStore.resetDraftState();
  }

  onFocusToSearch() {
    this.isSearching = true;
    this.isFilterPanel = false;
  }

  onCloseOfSearch() {
    this.appStore.searchProducts('');
    this.isSearching = false;
  }

  onSearchTermChanged(term: string) {
    this.appStore.searchProducts(term);
  }

  // TODO Popup demo methods
  openPopup() {
    this.isPopupOpen.set(true);
  }

  closePopup() {
    this.isPopupOpen.set(false);
  }

  logout() {
    this.appStore.logout();
    this._router.navigate([AppRoutes.LOGIN]);
  }

  notifyGroupMembers() {
    const user = this.appStore.currentUser();

    const payload: IPostPayload = {
      method: PostMethods.NOTIFY,
      body: {
          data: user,
          id: 'Sheet0'
      }
    };
    this.closePopup()

    this._serviceMessage.showMessage(
      'Notifying group members...',
      ServiceMessageType.INFO
    );

    this._httpService.post(payload).then(resp => {
      if(resp.ok) {
        this._serviceMessage.showMessage(
          'Group members notified',
          ServiceMessageType.SUCCESS
        );
      }
    })
    .catch(async resp => 
      this._serviceMessage.showMessage(
          `Group notification failed: ${await resp.message}`,
          ServiceMessageType.ERROR
        ));
  }

  updateDraftProducts() {
    if (this.draftProductsList().length === 0) return;

    this._serviceMessage.showMessage('Updating...', ServiceMessageType.INFO);
    this.appStore.updateCartList(this.appStore.currentUser()!.productListId)
      .then(result => result
        ? this._serviceMessage.showMessage('Updated', ServiceMessageType.SUCCESS)
        : this._serviceMessage.showMessage('Update failed', ServiceMessageType.ERROR)
      );
  }
}
