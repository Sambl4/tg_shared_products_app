import { Component } from '@angular/core';
import { IProduct, ProductService } from '../../services/product.service';
import { TelegramService } from '../../services/telegram.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
    product: IProduct | null;
    constructor(
        private productService: ProductService,
        private telegramService: TelegramService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        const id = this.route.snapshot.paramMap.get('id') || '';
        this.product = this.productService.getProductById(+id) || null;
        console.log(this.product);
    }

}
