import { computed, effect, inject, Injectable, resource, signal, Signal } from '@angular/core';
import { HttpService, RequestedDataType } from './http.service';
import { LoadingService } from './loading.service';

export interface IProductGroup {
  groupId: string;
  groupName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductGroupService {
  private httpService = inject(HttpService);
  private loadingService = inject(LoadingService);

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

      this._productGroups.set(data);
      return data;
    },
  });

  private _productGroups = signal<IProductGroup[]>([]);
  productGroups = this._productGroups;

  constructor() {
    effect(() => {
      this.loadingService.setLoading(this._groups.isLoading());
    });
  }

  getProductGroups(): Signal<IProductGroup[]> {
    return this.productGroups;
  }
}
