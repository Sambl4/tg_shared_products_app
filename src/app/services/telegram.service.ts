import { DOCUMENT, Inject, Injectable } from '@angular/core';

interface ITgButton {
  setText(text: string): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
}

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private window;
  tg;
  tgWebView;
  
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    
  ) {
    this.window = this._document.defaultView;
    this.tg = (this.window && this.window.Telegram) ? this.window.Telegram.WebApp : null;
    this.tgWebView = (this.window && this.window.Telegram) ? this.window.Telegram.WebView : null;
   }

  get MainButton(): ITgButton {
    return this.tg.MainButton;
  }

  getUserInfo(): {userId: number, firstName: string}{
    const initDataUnsafe = this.tg.initDataUnsafe;
    const user = initDataUnsafe.user;

    const userId = user?.id;
    const firstName = user?.first_name;

    // extra fields that might be useful in future
    // const lastName = user?.last_name;
    // const username = user?.username;
    // const languageCode = user?.language_code;
    // const isPremium = user?.is_premium;
    return { userId, firstName };
  }

  getIsTgApp(): boolean {
    return this.tg.platform !== 'unknown';
  }

  ready(): void {
    this.tg.ready();
  }
}
