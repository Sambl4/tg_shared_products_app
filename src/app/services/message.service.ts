import { Injectable, signal } from '@angular/core';

export enum ServiceMessageType {
  ERROR = 'error',
  INFO = 'info',
  SUCCESS = 'success',
}

export interface IServiceMessage {
  type: ServiceMessageType;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  serviceMessage = signal<IServiceMessage | null>(null);

  setServiceMessage(text: string, type: ServiceMessageType, duration = 3000): void {
    this.serviceMessage.set({
      text,
      type
    });

    if (duration !== 0) {
      setTimeout(() => {
        this.serviceMessage.set(null);
      }, duration);
    }
  }

  resetServiceMessage(): void {
    this.serviceMessage.set(null);
  }
}
