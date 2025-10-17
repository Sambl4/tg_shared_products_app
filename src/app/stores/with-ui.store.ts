import { inject } from "@angular/core";
import { patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { TelegramService } from "../services/telegram.service";
import { IUser } from "../services/login.service";


interface IUiState {
  isLoading: boolean;
  serviceMessage: string | null;
  searchTerm: string;
  isRequiredProductList: boolean;
  isDraftList: boolean;
  isFilterPanel: boolean;
  isSearching: boolean;
}

const initialUiState: IUiState = {
  isLoading: false,
  serviceMessage: null,
  searchTerm: '',
  isRequiredProductList: true,
  isDraftList: false,
  isFilterPanel: false,
  isSearching: false,
}



export const withUiStore = function() {
  return signalStoreFeature(
    withState(initialUiState),
  );
}
