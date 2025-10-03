import { Component } from '@angular/core';
import { PopupComponent } from '../../components/popup/popup.component';

@Component({
  selector: 'app-login.component',
  standalone: true,
  imports: [PopupComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isGroupListOpen = false;

  openGroupList() {
    this.isGroupListOpen = true;
  }
}
