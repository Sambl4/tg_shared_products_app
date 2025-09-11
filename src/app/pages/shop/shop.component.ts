import { Component, inject } from '@angular/core';
import { TelegramService } from '../../services/telegram.service';
import { ProductGroup, ProductService } from '../../services/product.service';
import { ProductListComponent } from '../../components/product-list.component/product-list.component';
import { Router } from '@angular/router';
import { FeedbackComponent } from '../feedback/feedback.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [ProductListComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent {
    telegram = inject(TelegramService);
    products = inject(ProductService);
    productGroupsName = Object.values(ProductGroup);
    feedback = FeedbackComponent.prototype.feedback;

    constructor(
        private router: Router,
    ) {
        this.telegram.MainButton.setText('Start Order');
        this.telegram.MainButton.show();
        console.log(this.feedback())
    }

    goToFeedback() {
        this.router.navigate(['/feedback']);
    }
}
