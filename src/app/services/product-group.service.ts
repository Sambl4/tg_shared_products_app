import { Injectable } from '@angular/core';
import { IProductGroup } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class ProductGroupService {
  private productGroups: IProductGroup[] = [
    { id: 1, name: 'Group A' },
    { id: 2, name: 'Group B' },
    { id: 3, name: 'Group C' }
  ];

  getProductGroups(): IProductGroup[] {
    return this.productGroups;
  }
}
