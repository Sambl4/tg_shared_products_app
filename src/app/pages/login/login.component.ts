import { Component, effect, inject, signal } from '@angular/core';
import { PopupComponent } from '../../components/popup/popup.component';
import { RouterLink } from '@angular/router';
import { TelegramService } from '../../services/telegram.service';
import { IProductGroup, LoginService } from '../../services/login.service';
import { ProductGroupService } from '../../services/product-group.service';

@Component({
  selector: 'app-login.component',
  standalone: true,
  imports: [RouterLink, PopupComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  telegram = inject(TelegramService);
  productGroupService = inject(ProductGroupService);
  loginService = inject(LoginService);

  productGroupList = this.productGroupService.getProductGroups();

  isGroupListOpen = false;
  selectedGroup  = signal<IProductGroup | null>(null);

  constructor() {
    this.telegram.MainButton.setText('Join group');
    this.confirmSelection = this.confirmSelection.bind(this);

    effect(() => {
      const group = this.selectedGroup();

      if (group) {
        this.telegram.MainButton.show();
      }
    });
  }

  ngOnInit(): void {
    this.telegram.MainButton.onClick(() => this.confirmSelection());
  }

  ngOnDestroy(): void {
    this.telegram.MainButton.offClick(() => this.confirmSelection());
  }

  openGroupList() {
    this.isGroupListOpen = true;
  }

  selectGroup(group: IProductGroup) {
    this.selectedGroup.set(group);
    this.isGroupListOpen = false;

    this.telegram.MainButton.show();
  }

  cancelSelection() {
    this.selectedGroup.set(null);
    this.telegram.MainButton.hide();
  }

  confirmSelection() {
    this.loginService.login(this.selectedGroup()!);
  }
}
