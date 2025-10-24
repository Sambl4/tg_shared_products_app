import { Component, computed, effect, inject, model, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { AppStore } from '../../stores/app.store';
import { IconComponent } from '../../components/icons/icons.component';
import { SearchComponent } from '../../components/search/search.component';
import { IProduct } from '../../stores/with-products.store';
import { PopupComponent } from '../../components/popup/popup.component';
import { TelegramService } from '../../services/telegram.service';
import { AppRoutes } from '../../app.routes';
import { MessageService, ServiceMessageType } from '../../services/message.service';
import { IPreset } from '../../services/preset.service';

enum EditModes {
  None,
  PresetName,
  NewProduct,
}

@Component({
  selector: 'app-edit-preset.component',
  standalone: true,
  imports: [ NgClass, NgTemplateOutlet, IconComponent, PopupComponent, SearchComponent],
  templateUrl: './edit-preset.component.html',
  styleUrl: './edit-preset.component.css'
})
export class EditPresetComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _appStore = inject(AppStore);
  private _telegram = inject(TelegramService);
  private _messageService = inject(MessageService);

  isTgApp = this._telegram.getIsTgApp();
  id = this._route.snapshot.paramMap.get('id') || '';

  currentPreset = this._appStore.presets().find(preset => preset.id === +this.id) as IPreset;
  
  draftPreset = signal<IPreset | null>(null);
  private _storeProducts = computed(() => this._appStore.products());
  generatedProducts = signal<Array<{ categoryName: string; categoryId: number; products: string[] }>>([]);

  productToDelete: IProduct | null = null;
  isConfirmationPopupOpen = false;

  productToEdit: IProduct | null = null;
  
  editMode = signal(EditModes.None);
  editModes = EditModes;
  searchTerm = model('');
  searchPlaceholder = '';
  isAiAvailable = false;
  isAiThinking = false;
  aiFeedbackMessage = signal('');
  initialSearchTerm = computed(() => 
    this.editMode() === EditModes.PresetName ? this.draftPreset()!.title : ''
  );

  private fullPresetsNameList = this._appStore.presets().map(preset => preset.title);

  forbiddenNames = computed(() => {
    return this.fullPresetsNameList.filter(name =>
      name.toLowerCase().includes(this.searchTerm().toLowerCase()));
  });

  filteredProductNames = computed(() => {
    return this._storeProducts().filter(product => 
      product.title.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
  });

  newProductList: IProduct[] = [];
  newProductsCount = signal(0);
  deletedProductList: IProduct[] = [];

  isAvailableToSaveChanges = computed(() => {
    const current = {
      ...this.currentPreset,
      products: this.currentPreset.products.sort((a, b) => a.id - b.id),
    };
    const draft = {
      ...this.draftPreset(),
      products: this.draftPreset()!.products.sort((a, b) => a.id - b.id),
    };
    return (
      JSON.stringify(current) !== JSON.stringify(draft) &&
      this.draftPreset()!.title.trim().length > 0 &&
      this.draftPreset()?.products.length! > 0 ||
      this.newProductsCount() > 0
    );
  })

  constructor() {
    this._telegram.MainButton.setText('Save changes');
    this.onSaveChanges = this.onSaveChanges.bind(this);
    this.navigateBack = this.navigateBack.bind(this);

    effect(() => {
      this.isAvailableToSaveChanges() && this.generatedProducts().length === 0 ?
        this._telegram.MainButton.show() :
        this._telegram.MainButton.hide();
    });

    const effectRef = effect(() => {
      const updatedProducts = this._appStore.products();
      const newGeneratedProductsNames = this.generatedProducts().flatMap(i=> i.products);
      const newCreatedProducts = updatedProducts
        .filter(product => newGeneratedProductsNames.includes(product.title));

          // Only proceed if we found the new products
          if(newCreatedProducts.length > 0) {
            this.draftPreset.update(current => ({
              ...current!,
              products: [],
              productIds: [...current!.productIds, ...newCreatedProducts.map(product => product.id)],
            }));

            this.generatedProducts.set([]);
            this.newProductList = [...this.newProductList, ...newCreatedProducts];
            this.newProductsCount.set(this.newProductList.length);
            this.isAiThinking = false;
            // Stop watching once we've processed the update
            effectRef.destroy();
          }
    });
  }

  ngOnInit(): void {
    let draftPreset = {} as IPreset;
    if(this.id === 'new') {
        draftPreset = {
        id: 0,
        title: '',
        productIds: [],
        products: [],
      };
      this.currentPreset = draftPreset;
      this.searchPlaceholder = 'Enter preset name';
      this.isAiAvailable = true;
      this.editMode.set(EditModes.PresetName);
    } else {
      draftPreset = this.currentPreset;
    }
    this.draftPreset.set(draftPreset);

    this._telegram.BackButton.show();
    this._telegram.MainButton.onClick(() => this.onSaveChanges());
    this._telegram.BackButton.onClick(() => this.navigateBack());
  }

  ngOnDestroy(): void {
    this._telegram.BackButton.hide();
    this._telegram.MainButton.offClick(() => this.onSaveChanges());
    this._telegram.BackButton.offClick(() => this.navigateBack());
  }

  editPresetName() {
    this.editMode.set(EditModes.PresetName);
  }

  onUpdateName() {
    this.draftPreset.update(current => ({
      ...current!,
      title: this.searchTerm(),
    }));
    this.searchTerm.set('');
    this.aiFeedbackMessage.set('');
    this.editMode.set(EditModes.None);
  }

  onGeneratePresetName() {
    const productListId = this._appStore.currentUser()!.productListId;
    this._messageService.showMessage('Generating preset', ServiceMessageType.INFO);
    this.isAiThinking = true;

    this._appStore.generatePreset(this.searchTerm(), productListId)
      .then(res => {
        if(res.message && res.message.length > 0) {
          this.aiFeedbackMessage.set(res.message);
        } else {
          const categoriesMap = this._appStore.productCategoryIdToNameMap();
          const transformedCategories = this.transformProductsToCategories(categoriesMap, res.newProducts);
        
          this.draftPreset.update(current => ({
            ...current!,
            title: res.title,
            products: [],
            productIds: res.products,
          }));

          this.newProductList = this._storeProducts().filter(product => res.products.includes(product.id));
          this.newProductsCount.set(this.newProductList.length);

          // Store the transformed categories if needed
          this.generatedProducts.set(transformedCategories);
          this.editMode.set(EditModes.None);
        }
        
        this._messageService.showMessage('Preset generated successfully', ServiceMessageType.SUCCESS);
      
      })
      .catch((e: Error) => {
        this._messageService.showMessage(e.message, ServiceMessageType.ERROR);
      })
      .finally(() => {
        this.isAiThinking = false;
      });
  }

  onRemoveGeneratedProduct(categoryId: number, productName: string) {
    let category = {} as { categoryName: string; categoryId: number; products: string[] };
    
    this.generatedProducts.update(current => {
      category = current.find(cat => cat.categoryId === categoryId)!;
      
      category.products = category.products.filter(prod => prod !== productName);
 
      return [...current];
    });
  
    if(category.products.length === 0) {
      this.generatedProducts.update(current => current.filter(cat => cat.categoryId !== categoryId));
    }
  }

  onCreateGeneratedProducts() {
    const productListId = this._appStore.currentUser()!.productListId;
    const generatedProducts = this.generatedProducts()
      .map(cat => cat.products
        .map(prod => ({
          title: prod,
          category: cat.categoryName,
          order: cat.categoryId,
          isChecked: false,
          isDone: false,
          isDraft: false,
          count: 1,
          color: null,
          id: Date.now(),
        }))
      )
      .flat();

    this._messageService.showMessage('Creating new products', ServiceMessageType.INFO);
    this.isAiThinking = true;

    this._appStore.createNewProducts(generatedProducts, productListId)
      .then(res => {
        if(res.status) {
          this._messageService.showMessage(res.text, ServiceMessageType.SUCCESS);
        } else {
          this._messageService.showMessage(res.text, ServiceMessageType.ERROR);
        }
      });
  }

  onSearchTermChanged(term: string) {
    this.searchTerm.set(term);
  }

  onCancelEdit() {
    this.searchTerm.set('');
    this.aiFeedbackMessage.set('');
    this.editMode.set(EditModes.None);
  }

  onDeleteProduct(product: IProduct) {
    this.productToDelete = product;
    this.isConfirmationPopupOpen = true;
  }

  onConfirmToDelete() {
    const filteredProducts = this.draftPreset()!.products.filter(prod => prod.id !== this.productToDelete?.id);
    this.draftPreset.update(current => ({
      ...current!,
      products: filteredProducts,
    }));
    this.deletedProductList.push(this.productToDelete!);
    this.productToDelete = null;
    this.isConfirmationPopupOpen = false;
  }

  onUndoDeleteProduct(product: IProduct) {
    this.draftPreset.update(current => ({
      ...current!,
      products: [...this.draftPreset()!.products, product],
    }));
    this.deletedProductList = this.deletedProductList.filter(prod => prod.id !== product.id);
  }

  onCancelDelete() {
    this.productToDelete = null;
    this.isConfirmationPopupOpen = false;
  }

  onAddProduct() {
    this.editMode.set(EditModes.NewProduct);
  }

  onSelectNewProduct(product: IProduct) {
    const isAlreadyAdded = this.draftPreset()!.products.find(prod => prod.id === product.id);
    if(!isAlreadyAdded) {
      this.newProductList.push(product);
      this.newProductsCount.set(this.newProductList.length);
    }

    this.searchTerm.set('');
    this.editMode.set(EditModes.None);
  }

  onDeleteNewProduct(product: IProduct) {
    this.newProductList = this.newProductList.filter(prod => prod.id !== product.id);
    this.newProductsCount.set(this.newProductList.length);
  }

  onSaveChanges() {
    const presetListId = this._appStore.currentUser()!.presetListId;
    const updatedProducts = [...this.draftPreset()!.products, ...this.newProductList];
    const updatedProductIds = updatedProducts.map(product => product.id);
    this.draftPreset.update(current => ({
      ...current!,
      products: updatedProducts,
      productIds: updatedProductIds,
    }));

    this._messageService.showMessage('Updating preset', ServiceMessageType.INFO);
    this._appStore.updatePreset(this.draftPreset()!, presetListId).then(res => {
      if(res.status) {
        this._messageService.showMessage(res.text, ServiceMessageType.SUCCESS);
      } else {
        this._messageService.showMessage(res.text, ServiceMessageType.ERROR);
      }
    });

    this.onRevertChanges();
    this._router.navigate([AppRoutes.PRESETS]);
    this._telegram.MainButton.hide();
  }

  onRevertChanges() {
    this.newProductList = [];
    this.newProductsCount.set(this.newProductList.length);
    this.deletedProductList = [];
    this.draftPreset.set(JSON.parse(JSON.stringify(this.currentPreset)));

    this.onCancelEdit();
  }

  navigateBack() {
    window.history.back();
  }

  private transformProductsToCategories(
    categoriesMap: Record<number, string>, 
    newProducts: Array<{ name: string; categoryId: number }>
  ): Array<{ categoryName: string; categoryId: number; products: string[] }> {
    // Group products by categoryId
    const groupedByCategory = newProducts.reduce((acc, product) => {
      const categoryId = product.categoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(product.name);
      return acc;
    }, {} as Record<number, string[]>);

    // Transform to the desired structure
    return Object.entries(groupedByCategory).map(([categoryId, products]) => ({
      categoryName: categoriesMap[+categoryId] || 'Unknown Category',
      categoryId: +categoryId,
      products: products
    }));
  }
}
