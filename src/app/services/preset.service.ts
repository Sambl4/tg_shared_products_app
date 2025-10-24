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

export interface IGeneratedPreset {
  title: string;
  products: number[];
  newProducts: { name: string; categoryId: number }[];
  message?: string;
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

  async generatePreset(presetName: string,productListId: string) {
    const payload: IPostPayload = {
      method: PostMethods.GENERATE_PRESET,
      body: {
        data: presetName,
        id: productListId
      }
    };
    return this._httpService
      .post(payload)
      .then(resp => resp)
      .catch(() => false);
  }
    
    // return new Promise((resolve) => {
    //   // TODO add error handling
    //   setTimeout(() => resolve(
    //     {
    //       ok: true,
    //       text: () => JSON.stringify({ 
    //       title: 'Борщ',
    //       products: [ 44, 27, 24, 26, 25, 20, 22, 74, 80, 94, 91, 23, 53 ],
    //       newProducts: 
    //       [ { name: 'Свекла', categoryId: 12 },
    //         { name: 'Чеснок', categoryId: 12 },
    //         { name: 'Томатная паста', categoryId: 10 },
    //         { name: 'Лавровый лист', categoryId: 6 }
    //       ],
    //       message: '',
    //     })
    //     }
    //   ),
    //   1000);
    // });
  // }
}
