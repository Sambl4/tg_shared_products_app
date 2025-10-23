import { inject } from "@angular/core";
import { patchState, signalStoreFeature, withHooks, withMethods, withState } from "@ngrx/signals";
import { TelegramService } from "../services/telegram.service";
import { IUser, LoginService } from "../services/login.service";
import { CacheKeys, CacheService } from "../services/cache.service";
import { IProductGroup } from "./with-products-group.store";

interface IUserState {
  currentUser: IUser | null;
  isLoggedIn: boolean;
  productGroups: IProductGroup[];
  isLoading: boolean;
}

const initialUserState: IUserState = {
  currentUser: null,
  isLoggedIn: false,
  productGroups: [],
  isLoading: false,
}

export const withUserStore = function() {
  return signalStoreFeature(
    withState(initialUserState),
    withMethods(store => {
      const telegram = inject(TelegramService);
      const loginService = inject(LoginService);
      const cacheService = inject(CacheService);

      return {
        createUser() {
          const { userId, firstName } = telegram.getUserInfo();
          const user: IUser = {
            id: userId || 555, // test user id
            name: firstName || 'Unknown',
            productListId: '',
            productListName: '',
            presetListId: '',
          };

          cacheService.saveToCache(CacheKeys.CURRENT_USER, user);
          patchState(store, { currentUser: user });
        },
        async joinGroup(group: IProductGroup): Promise<boolean> {
          const user: IUser = {
            ...store.currentUser()!,
            productListId: group!.groupId,
            productListName: group!.groupName,
            presetListId: group!.presetListId,
          };
          
          cacheService.saveToCache(CacheKeys.CURRENT_USER, user);
          patchState(store, {
            currentUser: user,
            isLoading: true,
          });
          
          return loginService.joinGroup(user)
            .then(result => result)
            .catch(() => false)
            .finally(() => {
              patchState(store, { isLoading: false });
            });
        },
        login() {
          cacheService.saveToCache(CacheKeys.LOGIN_STATE, true);
          patchState(store, { isLoggedIn: true });
        },
        logout() {
          cacheService.clearCache(CacheKeys.LOGIN_STATE);
          patchState(store, { isLoggedIn: false });
        }
      }
    }),
    withHooks({
      onInit(store) {
        const cacheService = inject(CacheService);
        const savedAuth = cacheService.getFromCache(CacheKeys.LOGIN_STATE);
        const currentUser = cacheService.getFromCache(CacheKeys.CURRENT_USER);

        if (!currentUser) return;
    
        patchState(store, { currentUser });
        if (savedAuth === true) {
          patchState(store, { isLoggedIn: true });
        }
      }
    }),
  );
}
