import { patchState, signalStoreFeature, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { IGeneratedPreset, IPreset, PresetService } from "../services/preset.service";
import { computed, effect, inject, signal, untracked } from "@angular/core";
import { IProduct } from "./with-products.store";

interface IPresetsState {
  isLoading: boolean;
  error: string | null;
  presets: IPreset[];
}

const initialPresetsState: IPresetsState = {
  isLoading: false,
  error: null,
  presets: [],
}

export const withPresetsStore = function() {
  return signalStoreFeature(
    withState(initialPresetsState),
    withProps(() => {
      const presetService = inject(PresetService);
      const resource = presetService.getPresetResource();
      return {
        _shouldLoad: signal<boolean>(false),
        _resource: resource,
      };
    }),
    withMethods(( store ) => {
      const presetService = inject(PresetService);

      effect(() => {
        const shouldLoad = store._shouldLoad();
        const resourceValue = store._resource.value();

        if(shouldLoad && resourceValue && resourceValue.length > 0) {
          patchState(store, { presets: resourceValue });
        }
      });

      return {
        async loadPresets(presetListId: string) {
          store._shouldLoad.set(true);
          presetService.shouldLoadPresets(presetListId);
        },
        async updatePreset(preset: IPreset, presetListId: string) {
          const presetToUpdate: IPreset = {
            title: preset.title,
            id: preset.id,
            productIds: [...preset.productIds, ...preset.unknownProductIds || []],
            products: [],
          };
          return presetService.updatePreset(presetToUpdate, presetListId)
            .then( async res => {
              if(typeof res === 'object' && res.ok) {
                  store._resource.reload();
                  return {
                    status: res.ok,
                    text: await res.text()
                  };
              } else {
                return {
                    status: false,
                    text: 'Preset data update failed',
                  };
              }
            });

        },
        async generatePreset(presetName: string, productListId: string) {
          return presetService.generatePreset(presetName, productListId)
            .then( async res => {
        //       return { 
        //   title: 'Борщ',
        //   products: [ 44, 27, 24, 26, 25, 20, 22, 74, 80, 94, 91, 23, 53 ],
        //   newProducts: 
        //   [ { name: 'Свекла', categoryId: 12 },
        //     { name: 'Чеснок', categoryId: 12 },
        //     { name: 'Томатная паста', categoryId: 10 },
        //     { name: 'Лавровый лист', categoryId: 6 }
        //   ],
        //   message: '',
        // };
            if(typeof res === 'object' && res.ok) {
                return JSON.parse(await res.text()) as IGeneratedPreset;
              } else {
                throw Error('Preset generation failed');
              }
          });
          
        },
        updatePresetProductsList(products: IProduct[]) {
          const storedPresets = store._resource.value() || [];

          if(storedPresets.length === 0) {
            return;
          }

          const presets = storedPresets.map(preset => {
            const presetProducts: IProduct[] = [];
            const unknownProductIds: number[] = [];

            preset.productIds.forEach(id => {
              const product = products.find(product => product.id === id);

              !!product ?
                presetProducts.push(product) :
                unknownProductIds.push(id);
            });

            return {
              ...preset,
              products: presetProducts,
              unknownProductIds
            };
          });

          patchState(store, { presets });
        },
      };
    }),
    withComputed(({ _shouldLoad, _resource }) => ({
      isLoading: computed(() => _shouldLoad() && _resource.isLoading()),
      error: computed(() => _shouldLoad() && _resource.error() || null),
    })),
  );
}