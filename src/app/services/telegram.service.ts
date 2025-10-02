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
  
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    
  ) {
    this.window = this._document.defaultView;
    this.tg = (this.window && this.window.Telegram) ? this.window.Telegram.WebApp : null;
   }

  get MainButton(): ITgButton {
  return this.tg.MainButton;
  }

  ready(): void {
    this.tg.ready();
  }
}
