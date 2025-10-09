import { Component, effect, inject, signal } from '@angular/core';
import { PopupComponent } from '../../components/popup/popup.component';
import { RouterLink } from '@angular/router';
import { TelegramService } from '../../services/telegram.service';
import { LoginService } from '../../services/login.service';
import { IProductGroup, ProductGroupService } from '../../services/product-group.service';
import { ProductService } from '../../services/product.service';

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
  isCancelAvailable = true;
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

  createUser() {
    this.loginService.createUser();
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
    this.telegram.MainButton.hide();
    this.isCancelAvailable = false;
    this.loginService.login(this.selectedGroup()!);
  }
}
