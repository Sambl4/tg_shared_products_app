import { Component, computed, effect, inject, model, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { AppStore } from '../../stores/app.store';
import { IconComponent } from '../../components/icons/icons.component';
import { SearchComponent } from '../../components/search/search.component';
import { IProduct, IProductCategory } from '../../stores/with-products.store';
import { PopupComponent } from '../../components/popup/popup.component';
import { TelegramService } from '../../services/telegram.service';
import { AppRoutes } from '../../app.routes';
import { MessageService, ServiceMessageType } from '../../services/message.service';

const testCategoryData = '{"id":"5","category":"мясо","products":[{"isDone":true,"title":"Курица филе; шт","count":4,"id":40,"category":"мясо","order":5,"color":""},{"isDone":true,"title":"Курица бедро; шт","count":8,"id":41,"category":"мясо","order":5,"color":""},{"isDone":false,"title":"Свинина таз; кг","count":1,"id":42,"category":"мясо","order":5,"color":""},{"isDone":false,"title":"Свинина корейка; кг","count":1,"id":43,"category":"мясо","order":5,"color":""},{"isDone":true,"title":"Говядина; кг","count":1,"id":44,"category":"мясо","order":5,"color":""},{"isDone":true,"title":"Дом Колбаски; шт","count":8,"id":45,"category":"мясо","order":5,"color":""},{"isDone":true,"title":"Фарш свин; кг","count":1,"id":46,"category":"мясо","order":5,"color":""},{"isDone":true,"title":"Фарш свин + гов; кг","count":1,"id":47,"category":"мясо","order":5,"color":""},{"isDone":true,"title":"Фарш кур; кг","count":1,"id":48,"category":"мясо","order":5,"color":""}]}'
const testCategoryList = '["заморозки","алко","напитки","сок","чай кофе","мясо","крупы","кондитерка","молоко","колбасы","холодильник","рыба","овощи","фрукты","хлеб","детское","хоз товар","аптека"]';

enum EditNameMode {
  Category,
  Product,
  NewProduct,
}

@Component({
  selector: 'app-edit-category.component',
  standalone: true,
  imports: [ NgClass, NgTemplateOutlet, IconComponent, PopupComponent, SearchComponent],
  templateUrl: './edit-category.component.html',
  styleUrl: './edit-category.component.css'
})
export class EditCategoryComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _appStore = inject(AppStore);
  private _telegram = inject(TelegramService);
  private _messageService = inject(MessageService);

  isTgApp = this._telegram.getIsTgApp();
  id = this._route.snapshot.paramMap.get('id') || '';

  currentCategory = signal<IProductCategory>({
    id: this.id,
    category: this._appStore.productCategoryIdToNameMap()[+this.id] || 'unknown',
    products: this._appStore.categoryIdToProductsList()[+this.id] || []
  });
  // currentCategory = signal<IProductCategory>(JSON.parse(testCategoryData) as IProductCategory);
  draftCategory = signal<IProductCategory>(JSON.parse(JSON.stringify(this.currentCategory())));

  productToDelete: IProduct | null = null;
  isConfirmationPopupOpen = false;

  productToEdit: IProduct | null = null;

  searchTerm = model(this.currentCategory().category);

  private fullCategoryList = Object.values(this._appStore.productCategoryIdToNameMap());
  // private fullCategoryList = JSON.parse(testCategoryList) as string[];
  forbiddenCategoryNames = computed(() => {
    return this.fullCategoryList.filter(name => name.includes(this.searchTerm()));
  });
  private fullProductList = this._appStore.products().map(product => product.title);
  forbiddenProductNames = computed(() => {
    return this.fullProductList.filter(title => title.includes(this.searchTerm()));
  });

  newProductList: IProduct[] = [];
  deletedProductList: IProduct[] = [];
  editedProductList: IProduct[] = [];

  searchInitialValue = computed(() => {
    if (this.editNameMode() === EditNameMode.Category) {
      return this.draftCategory().category;
    } else if (this.editNameMode() === EditNameMode.Product) {
      return this.productToEdit!.title;
    } else if (this.editNameMode() === EditNameMode.NewProduct) {
      return '';
    } else {
      return '';
    }
  });

  forbiddenNames = computed(() => {
    if (this.editNameMode() === EditNameMode.Category) {
      return this.fullCategoryList.filter(name => name.toLowerCase().includes(this.searchTerm().toLowerCase()));
    } else if (this.editNameMode() === EditNameMode.Product || this.editNameMode() === EditNameMode.NewProduct) {
      return this.fullProductList.filter(title => title.toLowerCase().includes(this.searchTerm().toLowerCase()));
    } else {
      return '';
    }
  });

  private newProductsCount = signal(0);
  isAvailableToSaveChanges = computed(() => {
    const current = {
      ...this.currentCategory(),
      products: this.currentCategory().products.sort((a, b) => a.id - b.id),
    };
    const draft = {
      ...this.draftCategory(),
      products: this.draftCategory().products.sort((a, b) => a.id - b.id),
    };
    return JSON.stringify(current) !== JSON.stringify(draft) || this.newProductsCount() > 0;
  })
  
  editNameMode = signal<EditNameMode | null>(null);

  constructor() {
    this._telegram.MainButton.setText('Save changes');
    this.onSaveChanges = this.onSaveChanges.bind(this);
    this.navigateBack = this.navigateBack.bind(this);

    effect(() => {
      this.isAvailableToSaveChanges() ?
        this._telegram.MainButton.show() :
        this._telegram.MainButton.hide();
    });
  }

  ngOnInit(): void {
    this._telegram.MainButton.onClick(() => this.onSaveChanges());
    this._telegram.BackButton.onClick(() => this.navigateBack());
  }

  ngOnDestroy(): void {
    this._telegram.MainButton.offClick(() => this.onSaveChanges());
    this._telegram.BackButton.offClick(() => this.navigateBack());
  }

  editCategoryName() {
    this.editNameMode.set(EditNameMode.Category);

    this.searchTerm.set(this.searchInitialValue());
  }

  onSearchTermChanged(term: string) {
    this.searchTerm.set(term);
  }

  onCancelEdit() {
    this.editNameMode.set(null);
    this.searchTerm.set('');
  }

  onUpdateName() {
    if (this.editNameMode() === EditNameMode.Category) {
      this.draftCategory.update(current => ({
        ...current,
        category: this.searchTerm(),
      }));
    } else if (this.editNameMode() === EditNameMode.Product) {
      this.draftCategory.update(current => ({
        ...current,
        products: this.draftCategory().products.filter(prod => prod.id !== this.productToEdit!.id),
      }));

      this.editedProductList.push({
        ...this.productToEdit!,
        title: this.searchTerm(),
      });
    } else if (this.editNameMode() === EditNameMode.NewProduct) {
      this.newProductList.push({
        title: this.searchTerm(),
        category: this.draftCategory().category,
        order: this.draftCategory().id ? +this.draftCategory().id : 0,
        isChecked: false,
        isDone: false,
        isDraft: false,
        count: 1,
        color: null,
        id: Date.now(),
      });

      this.newProductsCount.set(this.newProductList.length);
    }
    
    this.onCancelEdit();
  }

  onUndoEditProduct(product: IProduct) {
    const originalProduct = this.currentCategory().products.find(prod => prod.id === product.id)!;
    this.draftCategory.update(current => ({
      ...current,
      products: [...this.draftCategory().products, originalProduct],
    }));
    this.editedProductList = this.editedProductList.filter(prod => prod.id !== product.id);
  }

  onEditProduct(product: IProduct) {
    this.editNameMode.set(EditNameMode.Product);

    this.productToEdit = product;

    this.searchTerm.set(this.searchInitialValue());
  }

  onDeleteProduct(product: IProduct) {
    this.productToDelete = product;
    this.isConfirmationPopupOpen = true;
  }

  onConfirmToDelete() {
    const filteredProducts = this.draftCategory().products.filter(prod => prod.id !== this.productToDelete?.id);
    this.draftCategory.update(current => ({
      ...current,
      products: filteredProducts,
    }));
    this.deletedProductList.push(this.productToDelete!);
    this.productToDelete = null;
    this.isConfirmationPopupOpen = false;
  }

  onUndoDeleteProduct(product: IProduct) {
    this.draftCategory.update(current => ({
      ...current,
      products: [...this.draftCategory().products, product],
    }));
    this.deletedProductList = this.deletedProductList.filter(prod => prod.id !== product.id);
  }

  onCancelDelete() {
    this.productToDelete = null;
    this.isConfirmationPopupOpen = false;
  }

  onAddNewProduct() {
    this.editNameMode.set(EditNameMode.NewProduct);
    }

  onDeleteNewProduct(product: IProduct) {
    this.newProductList = this.newProductList.filter(prod => prod.id !== product.id);
    this.newProductsCount.set(this.newProductList.length);
  }

  onSaveChanges() {
    // TODO update BE to rename category
    if(this.draftCategory().category !== this.currentCategory().category) {
      this._messageService.showMessage('Category renaming is not implemented yet', ServiceMessageType.ERROR);
      return;   
    }

    const productListId = this._appStore.currentUser()!.productListId;
    if(this.editedProductList.length > 0) {
      this._messageService.showMessage('Updating product data', ServiceMessageType.INFO);
      this._appStore.updateProductsData(this.editedProductList, productListId)
        .then( res => {
          if(res.status) {
            this._messageService.showMessage(res.text, ServiceMessageType.SUCCESS);
          } else {
            this._messageService.showMessage(res.text, ServiceMessageType.ERROR);
          }
        }
      );
    }
    if(this.newProductList.length > 0) {
      this._messageService.showMessage('Creating new products', ServiceMessageType.INFO);
      this._appStore.createNewProducts(this.newProductList, productListId)
        .then(res => {
          this._messageService.showMessage(
            res.text,
            res.status ? ServiceMessageType.SUCCESS : ServiceMessageType.ERROR
          );
        });
    }
    if(this.deletedProductList.length > 0) {
      this._messageService.showMessage('Deleting products', ServiceMessageType.INFO);
      this._appStore.deleteProducts(this.deletedProductList, productListId)
        .then( res => {
          if(res.status) {
            this._messageService.showMessage(res.text, ServiceMessageType.SUCCESS);
          } else {
            this._messageService.showMessage(res.text, ServiceMessageType.ERROR);
          }
        }
      );
    }

    this.onRevertChanges();
    this._router.navigate([AppRoutes.PRODUCTS]);
    this._telegram.MainButton.hide();
  }

  onRevertChanges() {
    this.newProductList = [];
    this.newProductsCount.set(this.newProductList.length);
    this.deletedProductList = [];
    this.editedProductList = [];
    this.draftCategory.set(JSON.parse(JSON.stringify(this.currentCategory())));

    this.onCancelEdit();
  }

  navigateBack() {
    window.history.back();
  }
}
