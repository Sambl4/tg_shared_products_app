import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AppStore } from '../../stores/app.store';
import { PresetComponent } from '../../components/preset/preset.component';
import { SearchComponent } from '../../components/search/search.component';
import { TelegramService } from '../../services/telegram.service';
import { MessageService, ServiceMessageType } from '../../services/message.service';
import { Router } from '@angular/router';
import { AppRoutes } from '../../app.routes';

@Component({
  selector: 'app-presets-list.component',
  standalone: true,
  imports: [PresetComponent, SearchComponent],
  templateUrl: './presets-list.component.html',
  styleUrl: './presets-list.component.css'
})
export class PresetsListComponent implements OnInit, OnDestroy {
  private _router = inject(Router);
  private _appStore = inject(AppStore);
  private _telegram = inject(TelegramService);
  private _serviceMessage = inject(MessageService);

  private _userPresetListId = this._appStore.currentUser()?.presetListId || '';

  isPresetListExist = !!this._userPresetListId;

  searchTerm = signal('');
  
  presetList = computed(() => {
    const searchTerm = this.searchTerm().toLowerCase();
    const presets = this._appStore.presets();
    return presets.filter(preset =>
      preset.title.toLowerCase().includes(searchTerm)
    );
  });

  constructor() {
    this._telegram.MainButton.setText('Update');
    this._telegram.MainButton.show();
    this.updateDraftProducts = this.updateDraftProducts.bind(this);

    effect(() => {
      // products update should trigger recalculation of this._appStore.presets() products
      const products = this._appStore.products();
      this._appStore.updatePresetProductsList(products);
    });

    effect(() => {
      this._appStore.draftProducts() ?
        this._telegram.MainButton.show() :
        this._telegram.MainButton.hide();
    });
  }

  ngOnInit(): void {
    if (this._appStore.presets().length === 0 && this._userPresetListId) {
      this._appStore.loadPresets(this._userPresetListId);
    }

    this._telegram.MainButton.onClick(() => this.updateDraftProducts());
  }

  ngOnDestroy(): void {
    this._telegram.MainButton.offClick(() => this.updateDraftProducts());
  }

  onCancel() {
    this.searchTerm.set('');
  }

  onCreatePreset() {
    this._router.navigate([AppRoutes.EDIT, AppRoutes.PRESET, 'new']);
  }

  private updateDraftProducts() {
    this._serviceMessage.showMessage('Updating...', ServiceMessageType.INFO);
    this._appStore.updateCartList(this._appStore.currentUser()!.productListId)
      .then(result => result
        ? this._serviceMessage.showMessage('Updated', ServiceMessageType.SUCCESS)
        : this._serviceMessage.showMessage('Update failed', ServiceMessageType.ERROR)
      );
  }
}
