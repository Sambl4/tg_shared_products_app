import { Component, inject, input, Input } from '@angular/core';
import { IconComponent } from '../icons/icons.component';
import { NgClass } from '@angular/common';
import { IProduct } from '../../stores/with-products.store';
import { AppStore } from '../../stores/app.store';
import { MessageService, ServiceMessageType } from '../../services/message.service';
import { Router } from '@angular/router';
import { AppRoutes } from '../../app.routes';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [IconComponent, NgClass],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  @Input() categoryName: string = '';
  products = input<IProduct[]>([]);

  private _router = inject(Router);
  private _appStore = inject(AppStore);
  private _serviceMessage = inject(MessageService);

  ngOnInit() {
  }

  addToDraft(id: number) {
    this._appStore.updateProductDraftState(id, true);
  }

  removeFromDraft(id: number) {
    this._appStore.updateProductDraftState(id, false);
  }

  updateCartById(product: IProduct) {
    const productListId = this._appStore.currentUser()!.productListId;

    this._serviceMessage.showMessage('Updating...', ServiceMessageType.INFO);
    this._appStore.updateCartById(product.id, productListId)
      .then(result => result
        ? this._serviceMessage.showMessage('Updated', ServiceMessageType.SUCCESS)
        : this._serviceMessage.showMessage('Update failed', ServiceMessageType.ERROR)
      );
  }
  goToProductCategory(productCategory: number) {
    this._router.navigate([AppRoutes.CATEGORIES, AppRoutes.CATEGORY, productCategory]);
  }
}
