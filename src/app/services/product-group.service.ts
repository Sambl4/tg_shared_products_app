import { inject, Injectable, resource, signal } from '@angular/core';
import { HttpService, RequestedDataType } from './http.service';
import { IProductGroup } from '../stores/with-products-group.store';

@Injectable({
  providedIn: 'root'
})
export class ProductGroupService {
  private _httpService = inject(HttpService);

  // resource params: () => undefined prevents auto loading
  private _shouldLoad = signal<boolean | undefined>(undefined);

  private _groupsResource = resource<IProductGroup[], unknown>({
    params: () => this._shouldLoad(),
    loader: async () => {
      const resp = await this._httpService
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

  getProductResource() {
    return this._groupsResource;
  }

  shouldLoadGroups(load: boolean) {
    this._shouldLoad.set(load);
  }
}
