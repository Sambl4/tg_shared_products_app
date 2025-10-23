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

  productToDelete: IProduct | null = null;
  isConfirmationPopupOpen = false;

  productToEdit: IProduct | null = null;
  
  editMode = signal(EditModes.None);
  editModes = EditModes;
  searchTerm = model('');
  searchPlaceholder = '';
  initialSearchTerm = computed(() => 
    this.editMode() === EditModes.PresetName ? this.draftPreset()!.title : ''
  );

  // private fullCategoryList = this._appStore.presets().map(preset => preset.title);
  private fullPresetsNameList = ['qqq', 'wwww'];
  forbiddenNames = computed(() => {
    return this.fullPresetsNameList.filter(name =>
      name.toLowerCase().includes(this.searchTerm().toLowerCase()));
  });

  filteredProductNames = computed(() => {
    return this._appStore.products().filter(product => 
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
      this.isAvailableToSaveChanges() ?
        this._telegram.MainButton.show() :
        this._telegram.MainButton.hide();
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
    this.editMode.set(EditModes.None);
  }

  onSearchTermChanged(term: string) {
    this.searchTerm.set(term);
  }

  onCancelEdit() {
    this.searchTerm.set('');
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
}
