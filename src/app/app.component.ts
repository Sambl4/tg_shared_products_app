import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TelegramService } from './services/telegram.service';
import { LoaderComponent } from './components/loader/loader.component/loader.component';
import { ProductService } from './services/product.service';
import { IconComponent } from './components/icons/icons.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IconComponent, LoaderComponent, NgClass ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected readonly title = signal('tgApp');
  telegram = inject(TelegramService);
  productService = inject(ProductService);
  isLoading = signal(false);

  constructor() {
    this.telegram.ready();
  }
}
