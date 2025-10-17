import { Injectable } from '@angular/core';

export enum CacheKeys {
  PRODUCTS = 'tg_products_cache',
  LOGIN_STATE = 'tg_login_state',
  CURRENT_USER = 'tg_current_user',
}

@Injectable({
  providedIn: 'root'
})

export class CacheService {
  getFromCache(key: CacheKeys): any {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }

      const cached = localStorage.getItem(key);
      if (!cached) {
        console.log('No cache found in Telegram storage');
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.warn('Error reading from Telegram cache:', error);
      // Clear corrupted cache
      this.clearCache(key);
      return null;
    }
  }

  saveToCache(key: CacheKeys, data: any): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage not available in this environment');
        return;
      }

      localStorage.setItem(key, JSON.stringify(data));
      
    } catch (error) {
      console.warn('Failed to cache data in Telegram storage:', error);
      // Handle storage quota exceeded
      if (typeof error === 'object' && error !== null && 'name' in error && (error as { name: string }).name === 'QuotaExceededError') {
        this.clearCache(key);
        console.log('Storage quota exceeded, cleared cache');
      }
    }
  }

  clearCache(key: CacheKeys): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }
}
