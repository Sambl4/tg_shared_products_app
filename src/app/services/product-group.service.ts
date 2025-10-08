import { computed, inject, Injectable, resource, Signal } from '@angular/core';
import { IProductGroup } from './login.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductGroupService {
  // private productService = inject(ProductService);
  // private productGroups: IProductGroup[] = [
  //   { id: 1, name: 'Group A' },
  //   { id: 2, name: 'Group B' },
  //   { id: 3, name: 'Group C' }
  // ];

  private _groups = resource<IProductGroup[], unknown>({
    loader: async () => {
      const resp = await fetch(`${environment.apiUrl}?type=groups`).then(res => ({
        data: res.json(),
        status: res.ok,
      }));

      if(!resp.status) {
        throw Error('Failed to load products');
      }
      const data = await resp.data;
      
      return data;
    },
  });

  private _productGroups = computed(() => this._groups.value() || []);
  productGroups = this._productGroups;//.asReadonly();

  getProductGroups(): Signal<IProductGroup[]> {
    return this.productGroups;
  }
}
