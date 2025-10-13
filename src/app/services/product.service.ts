import { computed, effect, inject, Injectable, resource, Signal, signal } from '@angular/core';
import { CacheKeys, CacheService } from './cache.service';
import { IUser } from './login.service';
import { HttpService, IPostPayload, PostMethods, RequestedDataType } from './http.service';
import { LoadingService } from './loading.service';
import { MessageService, ServiceMessageType } from './message.service';

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
  private httpService = inject(HttpService);
  private loadingService = inject(LoadingService);
  private messageService = inject(MessageService);
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
      // TODO move to store service
      const user = this.loginService.getFromCache(CacheKeys.CURRENT_USER) as IUser;
      const resp = await this.httpService.get({
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
      this.messageService.setServiceMessage(
        'Data loaded',
        ServiceMessageType.SUCCESS,
      )

      this.cacheService.saveToCache(CacheKeys.PRODUCTS, data);
      this._products.set(data);

      return data;
    },
  });

  private _products = signal<IProduct[]>([]);
  products = this._products.asReadonly();

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

    effect(() => {
      let loadingState = false;
      if (!isTestData) {
        const isDataLoading = this._apiData.isLoading();
        const hasCachedData = this._products().length > 0;

        loadingState = isDataLoading && !hasCachedData;
      };

      this.loadingService.setLoading(loadingState)
    });

    effect(() => {
      const error = this._apiData.error();

      if(error) {
        this.messageService.setServiceMessage(error.message, ServiceMessageType.ERROR);
      }
    });
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
      this.messageService.setServiceMessage(
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

    const payload: IPostPayload = {
      method: PostMethods.UPDATE,
      body: {
        data: products,
        id: user.productListId
      }
    };

    this.messageService.setServiceMessage('Updating...', ServiceMessageType.INFO);

    this.httpService.post(payload).then(async resp => {
      if(resp.ok) {
        this.messageService.setServiceMessage(await resp.text(), ServiceMessageType.SUCCESS);
        this.resetDraftState();
      }
    })
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
