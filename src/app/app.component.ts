import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TelegramService } from './services/telegram.service';
import { LoaderComponent } from './components/loader/loader.component/loader.component';
import { IconComponent } from './components/icons/icons.component';
import { NgClass } from '@angular/common';
import { LoadingService } from './services/loading.service';
import { MessageService } from './services/message.service';
import { AppStore } from './stores/app.store';
import { AppRoutes } from './app.routes';

@Component({
  selector: 'app-root',
  imports: [
    NgClass,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    IconComponent,
    LoaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected readonly title = signal('tgApp');
  telegram = inject(TelegramService);
  loadingService = inject(LoadingService);
  serviceMessage = inject(MessageService);
  appStore = inject(AppStore);

  protected readonly appRoutes = AppRoutes;

  navigationButtons = [
    { name: 'listCheck', route: AppRoutes.PRODUCTS },
    { name: 'box', route: AppRoutes.PRESETS },
    { name: 'edit', route: `${AppRoutes.EDIT}/${AppRoutes.CATEGORIES}` },
  ];

  constructor() {
    this.telegram.ready();
  }
}
