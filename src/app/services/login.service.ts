import { inject, Injectable, signal } from '@angular/core';
import { TelegramService } from './telegram.service';
import { CacheKeys } from './cache.service';
import { Router } from '@angular/router';
import { HttpService, IPostPayload, PostMethods } from './http.service';
import { IProductGroup } from './product-group.service';
import { AppRoutes } from '../app.routes';

export interface IUser {
  id: number;
  name: string;
  productListId: string;
  productListName: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private telegram = inject(TelegramService);
  private httpService = inject(HttpService);
  private router = inject(Router);

  private _isLoggedIn = signal(false);
  private _currentUser = signal<IUser | null>(null);

  isLoggedIn = this._isLoggedIn.asReadonly();
  currentUser = this._currentUser.asReadonly();

  constructor() {
    this.checkExistingAuth();
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    this._isLoggedIn.set(false);
    this.router.navigate([AppRoutes.LOGIN]);
  }

  createUser(): void {
    const { userId, firstName } = this.telegram.getUserInfo();
    const user: IUser = {
      id: userId || 0,
      name: firstName || 'Unknown',
      productListId: '',
      productListName: '',
    };

    this._currentUser.set(user);
    localStorage.setItem(CacheKeys.CURRENT_USER, JSON.stringify(user));
  }

  login(group: IProductGroup): void {
    this._currentUser.update(user => ({
      ...user!,
        productListId: group!.groupId,
        productListName: group!.groupName,
    }))

    const user = this._currentUser()!;
    localStorage.setItem(CacheKeys.CURRENT_USER, JSON.stringify(user));

    const payload: IPostPayload = {
      method: PostMethods.USER_UPDATE,
      body: {
        data: user,
        id: user.productListId,
      }
    }

    this.httpService.post(payload).then(async resp => {
      if(resp.ok) {
        this._isLoggedIn.set(true);
        localStorage.setItem('isLoggedIn', 'true');
        this.router.navigate([AppRoutes.PRODUCTS]);
      }
    })
  }

  private checkExistingAuth(): void {
    const savedAuth = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem(CacheKeys.CURRENT_USER);
    if (!currentUser) return;

    this._currentUser.set(JSON.parse(currentUser));
    if (savedAuth === 'true') {
      this._isLoggedIn.set(true);

      this.router.navigate([AppRoutes.PRODUCTS]);
    }
  }
}
