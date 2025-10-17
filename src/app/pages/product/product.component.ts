import { Component } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { TelegramService } from '../../services/telegram.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IProduct } from '../../stores/with-products.store';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent { 
  product: IProduct | null;
  constructor(
    private _productService: ProductService,
    private _telegramService: TelegramService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) {
    const id = this._route.snapshot.paramMap.get('id') || '';
    this.product = this._productService.getProductById(+id) || null;
    console.log(this.product);
  }
}
