import { Component, effect, inject, OnDestroy, OnInit, resource, signal } from '@angular/core';
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
export class ShopComponent implements OnInit, OnDestroy {
    telegram = inject(TelegramService);
    products = inject(ProductService);
    productGroupsName = Object.values(ProductGroup);
    data = signal('');

    apiData = resource({
        loader: () => {
            return fetch(environment.apiUrl).then(res => res.json())
        }
    })

    constructor(
        private router: Router,
    ) {
        this.telegram.MainButton.setText('show gas');
        this.telegram.MainButton.show();
        this.showData = this.showData.bind(this);
    }

    ngOnInit(): void {
        this.telegram.MainButton.onClick(() => this.showData);
    }

    ngOnDestroy(): void {
        this.telegram.MainButton.offClick(() => this.showData);
    }

    goToFeedback() {
        this.router.navigate(['/feedback']);
    }

    callGas() {
        console.log(this.apiData.value());
        this.showData();
    }

    callSpreadsheet() {
        console.log('');
    }

    private showData() {
        this.data.set(this.apiData.value()?.data);
    }
}
