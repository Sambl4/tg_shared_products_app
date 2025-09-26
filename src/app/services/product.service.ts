import { computed, effect, Injectable, resource, ResourceStatus, Signal, signal } from '@angular/core';
import { environment } from '../../environments/environment.prod.local';

// export enum ProductGroup {
//   Electronics = 'electronics',
//   Clothing = 'clothing',
//   Books = 'books',
// }


export type TProductCategory = {
  // [K in ProductGroup]: IProduct[];
  [K in string]: IProduct[];
};

export interface IProductCategory {
  category: string;
  id: number;
  products: IProduct[];
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
  providedIn: 'root'
})
export class ProductService {
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
    loader: async () => {
      const resp = await fetch(environment.apiUrl).then(res => ({
        data: res.json(),
        status: res.ok,
      }));

      if(!resp.status) {
        throw Error('Failed to load products');
      }
      return await resp.data;
    }
  });

  private _products = signal<IProduct[]>([]);
  products = this._products.asReadonly();
  isLoading = isTestData ? computed(() => false) : computed(() =>this._apiData.isLoading());
  error = computed(() => this._apiData.error());

  draftProductCount = computed(() => {
    const products = this._products();
    return products.filter((prod) => prod.isDraft).length;
  });

  productCategoriesMap = computed<Record<number, string>>(() => {
    // const products = this._apiData.value();
    const products = this._products();
    if (!products) {
      return {};
    }
    return products.reduce((acc, product) => {
      acc[product.order || 0] = product.category;
      return acc;
    }, {} as Record<number, string>);
  });

  constructor() {
    effect(() => {
      const data = this._apiData.value();

      if (data) {
        this._products.set(data);
      }
    });
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

  removeProductFromCart(id: number) {
    this._products.update(currentItems => currentItems.map(item => item.id === id ? {...item, isDone: false} : item));
  }

  updateCart(id: number) {
    // TODO update for backend by id
    this._products.update(currentItems => currentItems.map(item => item.id === id ? {...item, isDone: true} : item));
    this.updateProductDraftState(id, false);
  }

  getProductsByCategoryId(categoryId: string): Signal<IProduct[]> {
    // return signal(this.products().filter((product: IProduct) => product.order === +categoryId));
    return computed(() => {
      const prod = this.products();
      const filteredProd = prod.filter((product: IProduct) => product.order === +categoryId)

      return filteredProd;
    });
  }

  // getProductsCategories(): IProductCategory[] {
  //   const categoryList = Array.from(this.productCategoriesMap());

  //   return categoryList.map(category => ({

  //           id: category[0],
  //           category: category[1],
  //           products: this.productsCategory[category[0]],
  //   }));
  // }

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
