import { computed, inject, signal, untracked } from "@angular/core";
import { patchState, signalStoreFeature, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { ProductService } from "../services/product.service";
import { CacheKeys, CacheService } from "../services/cache.service";


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

interface IProductsState {
  isLoading: boolean;
  error: string | null;
  products: IProduct[];
  productCategoryIdToNameMap: Record<number, string>;

  productCategories: Record<string, TProductCategory>;
  isRequiredProductList: boolean;
  filteredCategories: Record<string, boolean>;
  categoryIdToProductsList: Record<string, IProduct[]>;
  draftProducts: IProduct[];
  searchTermProductsList: IProduct[];
}

const initialProductsState: IProductsState = {
  isLoading: false,
  error: null,
  products: [],
  productCategoryIdToNameMap: {},
  productCategories: {},
  categoryIdToProductsList: {},
  isRequiredProductList: true,
  filteredCategories: {},
  draftProducts: [],
  searchTermProductsList: [],
}

export const withProductsStore = function() {
  return signalStoreFeature(
    withState(initialProductsState),
    withProps(() => {
      const productService = inject(ProductService);
      const resource = productService.getProductResource();
      return {
        _shouldLoad: signal<boolean>(false),
        _resource: resource,
      };
    }),
    withMethods(( store ) => {
      const productService = inject(ProductService);
      const cacheService = inject(CacheService);
            
      return {
        async loadCachedProducts() {
          const cachedData = cacheService.getFromCache(CacheKeys.PRODUCTS) as IProduct[] | null;
          const isDataAvailable = cachedData && cachedData.length > 0;
          
          if (isDataAvailable) {
            patchState( store, { products: cachedData } );
          }
          
          return isDataAvailable;
        },
        async loadProducts() {
          store._shouldLoad.set(true);
          productService.shouldLoadProducts(true);
        },
        async updateCartList(productsListId: string) {
          let updatedProducts: IProduct[] = [];

          const products = store.products().map(item => {
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
          });

          patchState(store, {
            products,
            draftProducts: [],
          });
          return productService.updateCartList(updatedProducts, productsListId);
        },
        async updateCartById(productId: number, productListId: string) {
          let updatedProduct = {} as IProduct;

          const products = store.products().map(item => {
            if (item.id === productId) {
              updatedProduct = {
                ...item,
                isDone: !item.isDone,
                isDraft: false,
              };
              return updatedProduct;
            } else {
              return item;
            }
          });
          const draftProducts = products.filter((prod) => prod.isDraft);

          patchState(store, {
            products,
            draftProducts,
          });
          return productService.updateCartById(updatedProduct, productListId);
        },
        async updateProductsData(products: IProduct[], productListId: string) {
          return productService.updateProductData(products, productListId);
        },
        async deleteProducts(products: IProduct[], productListId: string) {
          return productService.deleteProducts(products, productListId);
        },
        async createNewProducts(products: IProduct[], productListId: string) {
          return productService.createNewProducts(products, productListId)
          .then( async res => {
            if(typeof res === 'object' && res.ok) {
                store._resource.reload();
                return {
                  status: await res.ok,
                  text: await res.text()
                };
            } else {
              return {
                  status: false,
                  text: 'Products creation failed',
                };
            }
          });
        },
        updateCategoryName(categoryId: number, newCategoryName: string) {
          

        },
        setIsRequiredProductList(state: boolean) {
          patchState(store, { isRequiredProductList: state });
        },
        updateProductDraftState(id: number, state: boolean): void {
          const products = store.products().map(item => item.id === id ? {...item, isDraft: state} : item);
          const draftProducts = products.filter((prod) => prod.isDraft);

          patchState(store, { 
            products,
            draftProducts,
          });
        },
        resetDraftState() {
          const products = store.products().map(item => item.isDraft ? {...item, isDraft: false} : item);
          patchState(store, { 
            products,
            draftProducts: [],
          });
        },
        searchProducts(term: string) {
          const searchTermProductsList = store.products().filter((product: IProduct) =>
            product.title.toLowerCase().includes(term.toLowerCase()
          ));

          patchState(store, { searchTermProductsList });
        },
        filterByCategory(categoryId: string) {
          const currentFilters = store.filteredCategories();
          const filteredCategories = {
            ...currentFilters,
              [categoryId]: currentFilters[categoryId] ?
              !currentFilters[categoryId] : true
          }

          patchState(store, { filteredCategories });
        },
        resetCategoryFilter() {
          patchState(store, { filteredCategories: {} });
        },
      }
    }),
    withComputed(({
      products,
      isRequiredProductList,
      filteredCategories,
      _shouldLoad,
      _resource
    }) => {
      const isLoading = computed(() => _shouldLoad() && _resource.isLoading());
      const loadedProducts = computed(() => _shouldLoad() && _resource.value() || []);
      const error = computed(() => _shouldLoad() && _resource.error() || 'null');

      const productCategoryIdToNameMap = computed<Record<number, string>>(() => {
        const _loadedProducts = loadedProducts();
        const _cachedProducts = untracked(() => products());
        const productsToUse = _loadedProducts.length > 0 ? _loadedProducts : _cachedProducts;
        if (!productsToUse) {
          return {};
        }
        return productsToUse.reduce((acc, product) => {
          acc[product.order || 0] = product.category;
          return acc;
        }, {} as Record<number, string>);
      });

      const categoryIdToProductsList = computed<Record<string, IProduct[]>>(() => {
        const _products = products();
        return _products.reduce((category: Record<string, IProduct[]>, product: IProduct): Record<string, IProduct[]> => {
          // order is id of category
          const type = product.order;
          if (!category[type]) {
            category[type] = [];
          }
          category[type].push(product);
          return category;
        }, {});
      });

      const productCategories = computed(() => {
        const categoryIdToName = productCategoryIdToNameMap();
        const categoryIdToProducts = categoryIdToProductsList();

        if (!categoryIdToName && !categoryIdToProductsList) {
          return [];
        }
        return Object
          .entries(categoryIdToName)
          .map(([id, category]) => {
              const products = categoryIdToProducts[id]
                .filter((product: IProduct) => isRequiredProductList() ? !product.isDone : true);

              return {
                id,
                category,
                products,
                isHidden: products.length === 0,
                isFiltered: !!filteredCategories()[id],
              };
          });
      });
      
      return {
        isLoading,
        products: loadedProducts,
        productCategoryIdToNameMap,
        categoryIdToProductsList,
        error,
        productCategories,
      }
    }),
  );
}
