import { computed, effect, inject, Injectable, resource, ResourceStatus, Signal, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { CacheKeys, CacheService } from './cache.service';
import { IUser } from './login.service';

export type TProductCategory = {
  [K in string]: IProduct[];
};

export interface IProductCategory {
  category: string;
  id: string;
  products: IProduct[];
  isHidden?: boolean;
  isFiltered?: boolean;
}

export interface IProduct {
  title: string,
  category: string,
  order: number,
  isChecked: Boolean,
  isDone: Boolean,
  isDraft: Boolean,
  count: number,
  color: string | null,
  id: number,
}

export enum ServiceMessageType {
  ERROR = 'error',
  INFO = 'info',
  SUCCESS = 'success',
}

export interface IServiceMessage {
  type: ServiceMessageType;
  text: string;
}

export type TNewProduct = Omit<IProduct, 'id'>;

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
  private cacheService = inject(CacheService);
  private loginService = inject(CacheService);
  private _shouldLoad = signal(undefined as boolean | undefined);
  private _apiData = isTestData ? resource<IProduct[], unknown>({
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
      const user = this.loginService.getFromCache(CacheKeys.CURRENT_USER) as IUser;
      const resp = await fetch(`
        ${environment.apiUrl}?type=products&id=${user.productListId}
      `).then(res => ({
        data: res.json(),
        status: res.ok,
      }));

      if(!resp.status) {
        throw Error('Failed to load products');
      }
      const data = await resp.data;
      this.setServiceMessage(
        'Data loaded',
        ServiceMessageType.SUCCESS,
      )

      this.cacheService.saveToCache(CacheKeys.PRODUCTS, data);
      
      return data;
    },
  });

  private _products = signal<IProduct[]>([]);
  products = this._products.asReadonly();

  isLoading = computed(() => {
    if (isTestData) return false;

    const isDataLoading = this._apiData.isLoading();
    const hasCachedData = this._products().length > 0;

    return isDataLoading && !hasCachedData;
  });
  error = computed(() => this._apiData.error());
  serviceMessage = signal<IServiceMessage | null>(null);

  draftProductCount = computed(() => {
    const products = this._products();
    return products.filter((prod) => prod.isDraft).length;
  });

  productCategoriesMap = computed<Record<number, string>>(() => {
    const products = this._products();
    if (!products) {
      return {};
    }
    return products.reduce((acc, product) => {
      acc[product.order || 0] = product.category;
      return acc;
    }, {} as Record<number, string>);
  });

  productsByCategory = computed<TProductCategory>(() => {
    const products = this._products();
    return products.reduce((category: TProductCategory, product: IProduct): TProductCategory => {
      // order is id of category
      const type = product.order;
      if (!category[type]) {
        category[type] = [];
      }
      category[type].push(product);
      return category;
    }, {});
  });

  constructor() {
    this.loadCachedDataIfAvailable();
  }

  loadProducts(): void {
    this._shouldLoad.set(true);
  }

  getProducts(): Signal<IProduct[]> {
    return this.products;
  }

  getProductById(id: number): IProduct | undefined {
    return this.products().find((product: IProduct) => product.id === id);
  }

  updateProductDraftState(id: number, state: boolean): void {
    this._products.update(currentItems => currentItems.map(item => item.id === id ? {...item, isDraft: state} : item));
  }

  private loadCachedDataIfAvailable(): void {
    const cachedData = this.cacheService.getFromCache(CacheKeys.PRODUCTS) as IProduct[] | null;
    if (cachedData && cachedData.length > 0) {
      this._products.set(cachedData);
      this.setServiceMessage(
        'Cached Data',
        ServiceMessageType.INFO
      );
    }
  }

  resetDraftState(): void {
    this._products.update(currentItems => currentItems.map(item => item.isDraft ? {...item, isDraft: false} : item));
  }

  updateCartById(id: number, newStatus: boolean) {
    let updatedProduct: IProduct | undefined;

    this._products.update(currentItems => currentItems
      .map(item => {
        if (item.id === id) {
          updatedProduct = {
            ...item,
            isDone: newStatus,
            isDraft: false,
          };
          return updatedProduct;
        } else {
          return item;
        }
      })
    );

    if(updatedProduct) {
      this.updateCart([updatedProduct]);
    }
  }

  updateCartList() {
    let updatedProducts: IProduct[] = [];

    const products = this._products.update(currentItems => currentItems
      .map(item => {
        if (item.isDraft) {
          const product = {
            ...item,
            isDone: !item.isDone,
            isDraft: false,
          }

          updatedProducts.push(product);
          return product;
        } else {
          return item;
        }
      }));

    if(updatedProducts.length) {
      this.updateCart(updatedProducts);
    }
  }

  private updateCart(products: IProduct[]) {
    const user = this.loginService.getFromCache(CacheKeys.CURRENT_USER) as IUser;

    const options = {
      method: 'POST',
      body: JSON.stringify({
        method: 'Update',
        data: products,
        id: user.productListId,
      }),
    }

    this.setServiceMessage('Updating...', ServiceMessageType.INFO);

    fetch(`${environment.apiUrl}`, options).then(async resp => {
      if(resp.ok) {
        this.setServiceMessage(await resp.text(), ServiceMessageType.SUCCESS);
        this.resetDraftState();
      }
    })
  }

  setServiceMessage(text: string, type: ServiceMessageType, duration = 3000): void {
    this.serviceMessage.set({
      text,
      type
    });

    if (duration !== 0) {
      setTimeout(() => {
        this.serviceMessage.set(null);
      }, duration);
    }
  }

  resetServiceMessage(): void {
    this.serviceMessage.set(null);
  }

  getProductsByCategoryId(categoryId: string): Signal<IProduct[]> {
    return computed(() => {
      const prod = this.products();
      const filteredProd = prod.filter((product: IProduct) => product.order === +categoryId)

      return filteredProd;
    });
  }

  getProductsCategories(): Record<number, string> {
    return this.productCategoriesMap();
  }

  get productsCategory() {
    return this.products().reduce((category: TProductCategory, product: IProduct): TProductCategory => {
      // order is id of category
      const type = product.order;
      if (!category[type]) {
        category[type] = [];
      }
      category[type].push(product);
      return category;
    }, {});
  }
}
