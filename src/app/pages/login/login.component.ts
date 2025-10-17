import { Component, effect, inject, signal } from '@angular/core';
import { PopupComponent } from '../../components/popup/popup.component';
import { Router } from '@angular/router';
import { TelegramService } from '../../services/telegram.service';
import { AppRoutes } from '../../app.routes';
import { AppStore } from '../../stores/app.store';
import { MessageService, ServiceMessageType } from '../../services/message.service';
import { IProductGroup } from '../../stores/with-products-group.store';
import { CacheKeys, CacheService } from '../../services/cache.service';

@Component({
  selector: 'app-login.component',
  standalone: true,
  imports: [ PopupComponent ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  appStore = inject(AppStore);  
  private _telegram = inject(TelegramService);
  private _cacheService = inject(CacheService);
  private _messageService = inject(MessageService);
  private _router = inject(Router);

  isGroupListOpen = false;
  isCancelAvailable = true;
  selectedGroup  = signal<IProductGroup | null>(null);
  isTgApp = this._telegram.getIsTgApp();

  constructor() {
    this._telegram.MainButton.setText('Join group');
    this.confirmSelection = this.confirmSelection.bind(this);

    effect(() => {
      const group = this.selectedGroup();

      if (group) {
        this._telegram.MainButton.show();
      }
    });
  }

  ngOnInit(): void {
    this._telegram.MainButton.onClick(() => this.confirmSelection());

    if (this._isUserLoggedIn()) {
      this._router.navigate([AppRoutes.PRODUCTS]);
    } else {
      this.appStore.getProductGroups();
    }
  }

  ngOnDestroy(): void {
    this._telegram.MainButton.offClick(() => this.confirmSelection());
  }

  createUser() {
    this.appStore.createUser();
  }

  openGroupList() {
    this.isGroupListOpen = true;
  }

  closeGroupList() {
    this.isGroupListOpen = false;
  }

  selectGroup(group: IProductGroup) { 
    this.selectedGroup.set(group);
    this.closeGroupList();

    this._telegram.MainButton.show();
  }

  cancelSelection() {
    this.selectedGroup.set(null);
    this._telegram.MainButton.hide();
  }

  confirmSelection() {
    this._telegram.MainButton.hide();
    this.isCancelAvailable = false;

    this.appStore.joinGroup(this.selectedGroup()!).then(result => {
      if(result) {
        this.appStore.login();
        this._router.navigate([AppRoutes.PRODUCTS]);
      } else {
        this._messageService.showMessage('Failed to join group', ServiceMessageType.ERROR);
      }
    });
  }

  private _isUserLoggedIn(): boolean {
    const cachedLoginState = this._cacheService.getFromCache(CacheKeys.LOGIN_STATE);

    if (cachedLoginState) {
      this.appStore.login();
    }
    return cachedLoginState;
  }
}
