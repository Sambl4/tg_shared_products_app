import { Component, inject, input } from '@angular/core';
import { ProductListComponent } from '../product-list.component/product-list.component';
import { NgClass } from '@angular/common';
import { IconComponent } from '../icons/icons.component';
import { AppRoutes } from '../../app.routes';
import { IPreset } from '../../services/preset.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preset',
  standalone: true,
  imports: [NgClass, ProductListComponent, IconComponent],
  templateUrl: './preset.component.html',
  styleUrl: './preset.component.css'
})
export class PresetComponent {
  preset = input<IPreset>();
  private _router = inject(Router);

  isPresetOpened = false;
  emptyListMsg = 'preset is empty';

  togglePreset() {
    this.isPresetOpened = !this.isPresetOpened;
  }

  onEditPreset() {
    this._router.navigate([AppRoutes.EDIT, AppRoutes.PRESET, this.preset()?.id]);
  }
}
