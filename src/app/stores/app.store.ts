import { Injectable, signal, computed, effect } from '@angular/core';
import { IUser } from '../services/login.service';
import { signalStore, withState } from '@ngrx/signals';
import { withUiStore } from './with-ui.store';
import { withUserStore } from './with-user.store';
import { withProductsStore } from './with-products.store';
import { withProductsGroupStore } from './with-products-group.store';

export interface IAppState {
  // User state
  // currentUser: IUser | null;
  // isLoggedIn: boolean;
  // productGroups: IProductGroup[];
  // selectedGroup: IProductGroup | null;
  
  // // Products state
  // products: IProduct[];
  // productCategories: Record<string, TProductCategory>;
  // filteredCategories: Record<string, boolean>;
  // draftProducts: IProduct[];

  // // UI state
  // isLoading: boolean;
  // serviceMessage: string | null;
  // searchTerm: string;
  // isRequiredProductList: boolean;
  // isDraftList: boolean;
  // isFilterPanel: boolean;
  // isSearching: boolean;
}

const initialState: Partial<IAppState> = {
  // User state
  // currentUser: null,
  // isLoggedIn: false,
  // productGroups: [],
  // selectedGroup: null,
  
  // // Products state
  // products: [],
  // productCategories: {},
  // filteredCategories: {},
  // draftProducts: [],
  
  // // UI state
  // isLoading: false,
  // serviceMessage: null,
  // searchTerm: '',
  // isRequiredProductList: true,
  // isDraftList: false,
  // isFilterPanel: false,
  // isSearching: false,
};

export const AppStore = signalStore(
    { providedIn: 'root' },
    // withState(initialState),
    withUserStore(),
    // withUiStore(),
    withProductsStore(),
    withProductsGroupStore(),
);