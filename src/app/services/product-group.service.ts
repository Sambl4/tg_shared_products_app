import { computed, inject, Injectable, resource, Signal } from '@angular/core';
import { HttpService, RequestedDataType } from './http.service';

export interface IProductGroup {
  groupId: string;
  groupName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductGroupService {
  private httpService = inject(HttpService);

  private _groups = resource<IProductGroup[], unknown>({
    loader: async () => {
      const resp = await this.httpService
        .get({ type: RequestedDataType.GROUPS })
        .then(res => ({
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
  productGroups = this._productGroups;

  getProductGroups(): Signal<IProductGroup[]> {
    return this.productGroups;
  }
}
