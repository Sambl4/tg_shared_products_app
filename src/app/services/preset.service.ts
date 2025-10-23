import { inject, Injectable, resource, signal } from '@angular/core';
import { HttpService, IPostPayload, PostMethods, RequestedDataType } from './http.service';
import { IProduct } from '../stores/with-products.store';

export interface IPreset {
  id: number,
  title: string,
  productIds: number[],
  products: IProduct[],
  unknownProductIds?: number[],
}

@Injectable({
  providedIn: 'root'
})
export class PresetService {
  private _httpService = inject(HttpService);

  // resource params: () => undefined prevents auto loading
  private _shouldLoad = signal<{id: string} | undefined>(undefined);

  private _presetResource = resource<IPreset[], {id: string} | undefined>({
    params: () => this._shouldLoad(),
    loader: async ({params}) => {
      const resp = await this._httpService
        .get({
          type: RequestedDataType.PRESETS,
          id: params ? params.id : undefined,
        })
        .then(res => ({
          data: res.json(),
          status: res.ok,
        }));

      if(!resp.status) {
        throw Error('Failed to load presets');
      }
      const data: IPreset[] = await resp.data;

      return data.map(preset => ({
        ...preset,
        productIds: JSON.parse(preset.productIds as unknown as string),
        products: [],
      }));
    },
  });

  getPresetResource() {
    return this._presetResource;
  }

  shouldLoadPresets(id: string) {
    this._shouldLoad.set({id});
  }

  async updatePreset(preset: IPreset, presetListId: string) {
    const payload: IPostPayload = {
      method: PostMethods.PRESET_UPDATE,
      body: {
        data: preset,
        id: presetListId
      }
    };
    return this._httpService
      .post(payload)
      .then(resp => resp)
      .catch(() => false);
  }
}
