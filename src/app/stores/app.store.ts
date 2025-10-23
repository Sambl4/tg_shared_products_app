
import { signalStore } from '@ngrx/signals';
import { withUserStore } from './with-user.store';
import { withProductsStore } from './with-products.store';
import { withProductsGroupStore } from './with-products-group.store';
import { withPresetsStore } from './with-preset.store';

export const AppStore = signalStore(
    { providedIn: 'root' },
    withUserStore(),
    withProductsStore(),
    withProductsGroupStore(),
    withPresetsStore(),
);