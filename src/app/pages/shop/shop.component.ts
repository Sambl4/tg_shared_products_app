import { Component, effect, inject, resource } from '@angular/core';
import { TelegramService } from '../../services/telegram.service';
import { ProductGroup, ProductService } from '../../services/product.service';
import { ProductListComponent } from '../../components/product-list.component/product-list.component';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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


    apiData = resource({
        loader: () => {
            return fetch(environment.apiUrl).then(res => res.json())
        }
    })

    constructor(
        private router: Router,
    ) {
        this.telegram.MainButton.setText('Start Order');
        this.telegram.MainButton.show();
    }

    goToFeedback() {
        this.router.navigate(['/feedback']);
    }

    callGas() {
        console.log(this.apiData.value())
    }

    callSpreadsheet() {
        console.log('')
    }
}
