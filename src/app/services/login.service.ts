import { inject, Injectable, signal } from '@angular/core';
import { TelegramService } from './telegram.service';
import { ProductService } from './product.service';

export interface IUser {
  id: number;
  name: string;
  productListId: number;
  productListName: string;
}

export interface IProductGroup {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  telegram = inject(TelegramService);
  productService = inject(ProductService);

  private _isLoggedIn = signal(false);
  private _currentUser = signal<IUser | null>(null);

  isLoggedIn = this._isLoggedIn.asReadonly();
  currentUser = this._currentUser.asReadonly();

  constructor() {
    // Check if user was previously logged in (from localStorage, sessionStorage, etc.)
    this.checkExistingAuth();
  }

  // login(): void {
  //   // Implement your login logic here
  //   this._isLoggedIn.set(true);
    
  //   // Optionally save to localStorage
  //   localStorage.setItem('isLoggedIn', 'true');
  // }

  logout(): void {
    this._isLoggedIn.set(false);
    localStorage.removeItem('isLoggedIn');
  }

  getCurrentUser(): IUser | null {
    return this._currentUser();
  }

  createUser(): IUser {
    return {
      id: Date.now(),
      name: '',
      productListId: 0,
      productListName: ''
    };
    // this._currentUser.set(user);
    // localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private checkExistingAuth(): void {
    const savedAuth = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this._currentUser.set(JSON.parse(currentUser));
    }
    if (savedAuth === 'true') {
      this._isLoggedIn.set(true);
    }
  }

  login(group: IProductGroup): void {
    // const user = this.getCurrentUser();
    // const payload = {
    //   type: user ? 'update_user' : 'create_user',
    //   user: {
    //     ...user ? user : this.createUser(),
    //     productListId: group!.id,
    //     productListName: group!.name,
    //   }
    // }

    

  }
}
