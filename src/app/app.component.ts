import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TelegramService } from './services/telegram.service';
import { LoaderComponent } from './components/loader/loader.component/loader.component';
import { ProductService } from './services/product.service';
import { IconComponent } from './components/icons/icons.component';
import { NgClass } from '@angular/common';
import { LoadingService } from './services/loading.service';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IconComponent, LoaderComponent, NgClass ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected readonly title = signal('tgApp');
  telegram = inject(TelegramService);
  loadingService = inject(LoadingService);
  serviceMessage = inject(MessageService);

  constructor() {
    this.telegram.ready();
  }
}
