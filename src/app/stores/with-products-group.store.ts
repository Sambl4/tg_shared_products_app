import { computed, inject, signal } from "@angular/core";
import { signalStoreFeature, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { ProductGroupService } from "../services/product-group.service";

export interface IProductGroup {
  groupId: string;
  groupName: string;
}

interface IProductsGroupState {
  isLoading: boolean;
  error: string | null;
  productGroups: IProductGroup[];
}

const initialProductsGroupState: IProductsGroupState = {
  isLoading: false,
  error: null,
  productGroups: [],
}

export const withProductsGroupStore = function() {
  return signalStoreFeature(
    withState(initialProductsGroupState),
    withProps(() => {
      const productGroupService = inject(ProductGroupService);
      const resource = productGroupService.getProductResource();
      return {
        _shouldLoad: signal<boolean>(false),
        _resource: resource,
      };
    }),
    withMethods(( store ) => {
      const productGroupService = inject(ProductGroupService);

      return {
        getProductGroups() {
          store._shouldLoad.set(true);
          productGroupService.shouldLoadGroups(true);
        }
      };
    }),
    withComputed(({ _shouldLoad, _resource }) => ({
      isLoading: computed(() => _shouldLoad() && _resource.isLoading()),
      productGroups: computed(() => _shouldLoad() && _resource.value() || []),
      error: computed(() => _shouldLoad() && _resource.error() || null),
    })),
  );
}
