import { Component, effect, inject, signal } from '@angular/core';
import { PopupComponent } from '../../components/popup/popup.component';
import { RouterLink } from '@angular/router';
import { TelegramService } from '../../services/telegram.service';
import { IProductGroup, LoginService } from '../../services/login.service';
import { ProductGroupService } from '../../services/product-group.service';
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
  userdata = signal('');

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

    const initDataUnsafe = this.telegram.tg.initDataUnsafe;
    // localStorage.setItem('currentUser', JSON.stringify(user));
    // this.telegram.tg.sendData(JSON.stringify(payload));
    const user = initDataUnsafe.user;

            const userId = user?.id;
            const firstName = user?.first_name;
            const lastName = user?.last_name; // Can be undefined
            const username = user?.username;   // Can be undefined
            const languageCode = user?.language_code;
            const isPremium = user?.is_premium; // Boolean, true if the user is Telegram Premium

            console.log('User ID:', userId);
            console.log('First Name:', firstName);
            console.log('Last Name:', lastName);
            console.log('Username:', username);
            console.log('Language Code:', languageCode);
            console.log('Is Premium:', isPremium);

            const chat = initDataUnsafe.chat;
            console.log('Chat ID:', chat?.id);
            console.log('Chat Title:', chat?.title);

            this.userdata.set(`
              'User ID:', ${userId} \n
              'First Name:', ${firstName} \n
              'Last Name:', ${lastName} \n
              'Username:', ${username} \n
              'Language Code:', ${languageCode} \n
              'Is Premium:', ${isPremium} \n
              'Chat ID:', ${chat?.id} \n
              'Chat Title:', ${chat?.title}
              `);
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
