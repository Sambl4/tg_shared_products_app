import { computed, effect, inject, Injectable, resource, Signal, signal } from '@angular/core';
import { CacheKeys, CacheService } from './cache.service';
import { IUser } from './login.service';
import { HttpService, IPostPayload, PostMethods, RequestedDataType } from './http.service';
import { LoadingService } from './loading.service';
import { MessageService, ServiceMessageType } from './message.service';
import { AppStore } from '../stores/app.store';
import { IProduct, TProductCategory } from '../stores/with-products.store';

// export type TProductCategory = {
//   [K in string]: IProduct[];
// };

// export interface IProductCategory {
//   category: string;
//   id: string;
//   products: IProduct[];
//   isHidden?: boolean;
//   isFiltered?: boolean;
// }

// export interface IProduct {
//   title: string,
//   category: string,
//   order: number,
//   isChecked: Boolean,
//   isDone: Boolean,
//   isDraft: Boolean,
//   count: number,
//   color: string | null,
//   id: number,
// }

// export type TNewProduct = Omit<IProduct, 'id'>;

const mockData = [{
title: 'item - a1',
category: 'a category',
order: 1,
isChecked: false,
isDone: true,
isDraft: false,
count: 10,
color: null,
id: 1
},
{
title: 'item - a2',
category: 'a category',
order: 1,
isChecked: false,
isDone: true,
isDraft: false,
count: 7,
color: null,
id: 2
},
{
title: 'item - a3',
category: 'a category',
order: 1,
isChecked: false,
isDone: true,
isDraft: false,
count: 2,
color: null,
id: 3
},
{
title: 'item - b1',
category: 'b category',
order: 2,
isChecked: false,
isDone: false,
isDraft: false,
count: 110,
color: null,
id: 4
},
{
title: 'item - b2',
category: 'b category',
order: 2,
isChecked: false,
isDone: false,
isDraft: false,
count: 10,
color: null,
id: 5
},
{
title: 'item - b3',
category: 'b category',
order: 2,
isChecked: false,
isDone: false,
isDraft: false,
count: 10,
color: null,
id: 6
},
{
title: 'item - b4',
category: 'b category',
order: 2,
isChecked: false,
isDone: false,
isDraft: false,
count: 10,
color: null,
id: 7
},
{
title: 'item - b5',
category: 'b category',
order: 2,
isChecked: false,
isDone: true,
isDraft: false,
count: 10,
color: null,
id: 8
},
{
title: 'item - b6',
category: 'b category',
order: 2,
isChecked: false,
isDone: false,
isDraft: false,
count: 10,
color: null,
id: 9
},
{
title: 'item - b7',
category: 'b category',
order: 2,
isChecked: false,
isDone: false,
isDraft: false,
count: 10,
color: null,
id: 10
}
];

const isTestData = false;

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private _cacheService = inject(CacheService);
  private _loginService = inject(CacheService);
  private _httpService = inject(HttpService);
  private _loadingService = inject(LoadingService);
  private _messageService = inject(MessageService);
  // private appStateService = inject(AppStore);
  private _shouldLoad = signal(undefined as boolean | undefined);
  private _productsResource = isTestData ?
   resource<IProduct[], unknown>({
    loader: async () => {
      const prom = new Promise((res, rej) => {
        setTimeout(()=>res(mockData),1000)
      })
      return await prom.then(r => {
        console.log(r);
        return r as IProduct[];
      });
    }
  }) :
  resource<IProduct[], unknown>({
    params: () => this._shouldLoad(),
    loader: async () => {
      // TODO move to store service
      const user = this._loginService.getFromCache(CacheKeys.CURRENT_USER) as IUser;
      const resp = await this._httpService.get({
        type: RequestedDataType.PRODUCTS,
        id: user.productListId,
      }).then(res => ({
        data: res.json(),
        status: res.ok,
      }));

      if(!resp.status) {
        throw Error('Failed to load products');
      }
      const data = await resp.data;
      this._messageService.showMessage(
        'Data loaded',
        ServiceMessageType.SUCCESS,
      )

      this._cacheService.saveToCache(CacheKeys.PRODUCTS, data);
      return data;
    },
  });

  getProductResource() {
    return this._productsResource;
  }

  shouldLoadProducts(load: boolean) {
    this._shouldLoad.set(load);
  }

  constructor() {
    // effect(() => {
    //   let loadingState = false;
    //   if (!isTestData) {
    //     const hasCachedData = this._products().length > 0;
    //   };

    //   this._loadingService.setLoading(loadingState)
    // });
  }

  async updateProductData(products: IProduct[], productListId: string) {
    return this.updateCart(products, productListId);
  }

  async deleteProducts(products: IProduct[], productListId: string) {
    const payload: IPostPayload = {
      method: PostMethods.DELETE,
      body: {
        data: products,
        id: productListId
      }
    };

    return this._httpService
      .post(payload)
      .then(resp => resp)
      .catch(() => false);
  }

  async createNewProducts(products: IProduct[], productListId: string) {
    const payload: IPostPayload = {
      method: PostMethods.CREATE,
      body: {
        data: products,
        id: productListId
      }
    };

    return this._httpService
      .post(payload)
      .then(resp => resp)
      .catch(() => false);
  }

  async updateCartById(product: IProduct, productListId: string) {
    return this.updateCart([product], productListId);

  }

  async updateCartList(products: IProduct[], productListId: string) {
    return this.updateCart(products, productListId);
  }

  private async updateCart(products: IProduct[], productListId: string) {
    const payload: IPostPayload = {
      method: PostMethods.UPDATE,
      body: {
        data: products,
        id: productListId
      }
    };


    // return new Promise((resolve) => {
    //   setTimeout(() => resolve(true), 1000);
    // })
    return this._httpService
      .post(payload)
      .then(resp => resp)
      .catch(() => false);
  }
}
