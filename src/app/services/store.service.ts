import { Injectable, signal, computed, effect } from '@angular/core';
import { IUser } from './login.service';
import { IProduct, TProductCategory } from './product.service';

export interface AppState {
  // User state
  currentUser: IUser | null;
  isLoggedIn: boolean;
  
  // Products state
//   products: IProduct[];
//   productCategories: Record<string, TProductCategory>;
//   filteredCategories: Record<string, boolean>;
//   draftProducts: IProduct[];
  
  // Product groups state
//   productGroups: IProductGroup[];
//   selectedGroup: IProductGroup | null;
  
  // UI state
//   isLoading: boolean;
//   serviceMessage: string | null;
//   searchTerm: string;
//   isRequiredProductList: boolean;
//   isDraftList: boolean;
//   isFilterPanel: boolean;
//   isSearching: boolean;
}

const initialState: AppState = {
  // User state
  currentUser: null,
  isLoggedIn: false,
  
  // Products state
//   products: [],
//   productCategories: {},
//   filteredCategories: {},
//   draftProducts: [],
  
  // Product groups state
//   productGroups: [],
//   selectedGroup: null,
  
  // UI state
//   isLoading: false,
//   serviceMessage: null,
//   searchTerm: '',
//   isRequiredProductList: true,
//   isDraftList: false,
//   isFilterPanel: false,
//   isSearching: false,
};

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // Private state signal
  private _state = signal<AppState>(initialState);
  
  // Public readonly state
  public readonly state = this._state.asReadonly();
  
  // Computed selectors for easy access
  public readonly currentUser = computed(() => this._state().currentUser);
  public readonly isLoggedIn = computed(() => this._state().isLoggedIn);
//   public readonly products = computed(() => this._state().products);
//   public readonly productCategories = computed(() => this._state().productCategories);
//   public readonly filteredCategories = computed(() => this._state().filteredCategories);
//   public readonly draftProducts = computed(() => this._state().draftProducts);
//   public readonly productGroups = computed(() => this._state().productGroups);
//   public readonly selectedGroup = computed(() => this._state().selectedGroup);
//   public readonly isLoading = computed(() => this._state().isLoading);
//   public readonly serviceMessage = computed(() => this._state().serviceMessage);
//   public readonly searchTerm = computed(() => this._state().searchTerm);
//   public readonly isRequiredProductList = computed(() => this._state().isRequiredProductList);
//   public readonly isDraftList = computed(() => this._state().isDraftList);
//   public readonly isFilterPanel = computed(() => this._state().isFilterPanel);
//   public readonly isSearching = computed(() => this._state().isSearching);
  
  // Computed derived values
//   public readonly draftProductCount = computed(() => this.draftProducts().length);
//   public readonly hasActiveFilters = computed(() => 
//     Object.values(this.filteredCategories()).some(value => value === true)
//   );
//   public readonly productsByCategory = computed(() => {
//     const products = this.products();
//     const categories: Record<string, IProduct[]> = {};
    
//     products.forEach(product => {
//       const categoryId = product.category?.toString() || 'other';
//       if (!categories[categoryId]) {
//         categories[categoryId] = [];
//       }
//       categories[categoryId].push(product);
//     });
    
//     return categories;
//   });
  
  constructor() {
    // Load initial state from localStorage
    // this.loadStateFromCache();
    
    // Auto-save state changes to localStorage
    effect(() => {
      const state = this._state();
      this.saveStateToCache(state);
    });
  }
  
  // User actions
  setCurrentUser(user: IUser | null): void {
    this._state.update(state => ({
      ...state,
      currentUser: user,
      isLoggedIn: !!user
    }));
  }
  
  logout(): void {
    this._state.update(state => ({
      ...state,
      currentUser: null,
      isLoggedIn: false,
      selectedGroup: null
    }));
  }
  
  // Products actions
//   setProducts(products: IProduct[]): void {
//     this._state.update(state => ({
//       ...state,
//       products,
//       draftProducts: products.filter(p => p.isDraft)
//     }));
//   }
  
//   addProduct(product: IProduct): void {
//     this._state.update(state => ({
//       ...state,
//       products: [...state.products, product]
//     }));
//   }
  
//   updateProduct(productId: number, updates: Partial<IProduct>): void {
//     this._state.update(state => ({
//       ...state,
//       products: state.products.map(p => 
//         p.id === productId ? { ...p, ...updates } : p
//       ),
//       draftProducts: state.products
//         .map(p => p.id === productId ? { ...p, ...updates } : p)
//         .filter(p => p.isDraft)
//     }));
//   }
  
//   removeProduct(productId: number): void {
//     this._state.update(state => ({
//       ...state,
//       products: state.products.filter(p => p.id !== productId),
//       draftProducts: state.draftProducts.filter(p => p.id !== productId)
//     }));
//   }
  
//   setProductCategories(categories: Record<string, TProductCategory>): void {
//     this._state.update(state => ({
//       ...state,
//       productCategories: categories
//     }));
//   }
  
  // Filter actions
//   setFilteredCategory(categoryId: string, isFiltered: boolean): void {
//     this._state.update(state => ({
//       ...state,
//       filteredCategories: {
//         ...state.filteredCategories,
//         [categoryId]: isFiltered
//       }
//     }));
//   }
  
//   clearAllFilters(): void {
//     this._state.update(state => ({
//       ...state,
//       filteredCategories: {}
//     }));
//   }
  
  // Product groups actions
//   setProductGroups(groups: IProductGroup[]): void {
//     this._state.update(state => ({
//       ...state,
//       productGroups: groups
//     }));
//   }
  
//   setSelectedGroup(group: IProductGroup | null): void {
//     this._state.update(state => ({
//       ...state,
//       selectedGroup: group
//     }));
//   }
  
  // UI actions
//   setLoading(isLoading: boolean): void {
//     this._state.update(state => ({
//       ...state,
//       isLoading
//     }));
//   }
  
//   setServiceMessage(message: string | null): void {
//     this._state.update(state => ({
//       ...state,
//       serviceMessage: message
//     }));
//   }
  
//   setSearchTerm(searchTerm: string): void {
//     this._state.update(state => ({
//       ...state,
//       searchTerm,
//       isSearching: searchTerm.length > 0
//     }));
//   }
  
//   setIsRequiredProductList(isRequired: boolean): void {
//     this._state.update(state => ({
//       ...state,
//       isRequiredProductList: isRequired
//     }));
//   }
  
//   setIsDraftList(isDraft: boolean): void {
//     this._state.update(state => ({
//       ...state,
//       isDraftList: isDraft
//     }));
//   }
  
//   setIsFilterPanel(isOpen: boolean): void {
//     this._state.update(state => ({
//       ...state,
//       isFilterPanel: isOpen
//     }));
//   }
  
  // Cache management
//   private loadStateFromCache(): void {
//     try {
//       const savedUser = localStorage.getItem('currentUser');
//       const savedAuth = localStorage.getItem('isLoggedIn');
      
//       if (savedUser) {
//         const user: IUser = JSON.parse(savedUser);
//         this.setCurrentUser(user);
//       }
      
//       if (savedAuth === 'true' && this.currentUser()) {
//         this._state.update(state => ({
//           ...state,
//           isLoggedIn: true
//         }));
//       }
//     } catch (error) {
//       console.error('Failed to load state from cache:', error);
//     }
//   }
  
  private saveStateToCache(state: AppState): void {
    try {
      if (state.currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
      } else {
        localStorage.removeItem('currentUser');
      }
      
      localStorage.setItem('isLoggedIn', state.isLoggedIn.toString());
    } catch (error) {
      console.error('Failed to save state to cache:', error);
    }
  }
  
  // Utility methods
  reset(): void {
    this._state.set(initialState);
    localStorage.clear();
  }
  
  // Debug helper
  getState(): AppState {
    return this._state();
  }
}
