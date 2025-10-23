import { Component } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { TelegramService } from '../../services/telegram.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent { 
  constructor(
    private _productService: ProductService,
    private _telegramService: TelegramService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) {
    const id = this._route.snapshot.paramMap.get('id') || '';
  }
}
