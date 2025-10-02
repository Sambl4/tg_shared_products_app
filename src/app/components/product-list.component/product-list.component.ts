import { Component, inject, input, Input } from '@angular/core';
import { IProduct, ProductService } from '../../services/product.service';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icons/icons.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, IconComponent, NgClass],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  @Input() categoryName: string = '';
  products = input<IProduct[]>([]);

  productService = inject(ProductService)

  constructor() {
  }

  ngOnInit() {
  }

  addToDraft(id: number) {
    // this.productService.updateProductDraftState(id, true);
  //   const products = this.productService.products();/
  // const currentProduct = products.find((product) => product.id === id);
  // if (currentProduct) {
    this.productService.updateProductDraftState(id, true);
  // }
  }

  removeFromDraft(id: number) {
    this.productService.updateProductDraftState(id, false);
  }

  // removeFromCart(id: number) {
  //   this.productService.removeProductFromCart(id);
  // }

  updateCartById(product: IProduct) {
    this.productService.updateCartById(product.id, !product.isDone);
  }
}
