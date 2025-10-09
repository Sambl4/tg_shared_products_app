import { inject, Injectable, signal } from '@angular/core';
import { TelegramService } from './telegram.service';
import { ProductService } from './product.service';
import { environment } from '../../environments/environment';
import { CacheKeys } from './cache.service';
import { Router } from '@angular/router';

export interface IUser {
  id: number;
  name: string;
  productListId: string;
  productListName: string;
}

export interface IProductGroup {
  groupId: string;
  groupName: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  telegram = inject(TelegramService);
  productService = inject(ProductService);
  private router = inject(Router);

  private _isLoggedIn = signal(false);
  private _currentUser = signal<IUser | null>(null);

  isLoggedIn = this._isLoggedIn.asReadonly();
  currentUser = this._currentUser.asReadonly();

  constructor() {
    this.checkExistingAuth();
  }

  logout(): void {
    this._isLoggedIn.set(false);
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }

  private getCurrentUser(): IUser | null {
    const userData = localStorage.getItem(CacheKeys.CURRENT_USER);
    return this._currentUser();
  }

  createUser(): void {
    const { userId, firstName } = this.readUserInfo();
    const user: IUser = {
      id: userId || 0,
      name: firstName || 'Unknown',
      productListId: '',
      productListName: '',
    };

    this._currentUser.set(user);
    localStorage.setItem(CacheKeys.CURRENT_USER, JSON.stringify(user));
  }

  private checkExistingAuth(): void {
    const savedAuth = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem(CacheKeys.CURRENT_USER);
    if (!currentUser) return;

    this._currentUser.set(JSON.parse(currentUser));
    if (savedAuth === 'true') {
      this._isLoggedIn.set(true);

      this.router.navigate(['/products']);
    }
  }

  private readUserInfo(): {userId: number, firstName: string} {
    const initDataUnsafe = this.telegram.tg.initDataUnsafe;
    const user = initDataUnsafe.user;

    const userId = user?.id;
    const firstName = user?.first_name;

    // const lastName = user?.last_name;
    // const username = user?.username;
    // const languageCode = user?.language_code;
    // const isPremium = user?.is_premium;
    return { userId, firstName };
  }

  login(group: IProductGroup): void {
    this._currentUser.update(user => ({
      ...user!,
        productListId: group!.groupId,
        productListName: group!.groupName,
    }))

    const user = this._currentUser();
    localStorage.setItem(CacheKeys.CURRENT_USER, JSON.stringify(user));

    const options = {
      method: 'POST',
      body: JSON.stringify({
        method: 'UserUpdate',
        data: user,
        id: 'Sheet1'
      }),
    }

    fetch(`${environment.apiUrl}`, options).then(async resp => {
      if(resp.ok) {
        this._isLoggedIn.set(true);
        localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/products']);
      }
    })
  }
}
