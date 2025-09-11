import { Injectable } from '@angular/core';

export enum ProductGroup {
  Electronics = 'electronics',
  Clothing = 'clothing',
  Books = 'books',
}

type TProductGroups = {
  // [K in ProductGroup]: IProduct[];
  [K in string]: IProduct[];
};

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  group: ProductGroup;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: IProduct[] = [
    // Electronics
    { id: '1', name: 'Smartphone', description: 'Latest model smartphone with advanced features.', price: 699, group: ProductGroup.Electronics },
    { id: '2', name: 'Laptop', description: 'High-performance laptop for work and play.', price: 1299, group: ProductGroup.Electronics },
    { id: '3', name: 'Wireless Headphones', description: 'Noise-cancelling over-ear headphones.', price: 199, group: ProductGroup.Electronics },
    // Clothing
    { id: '4', name: 'T-Shirt', description: '100% cotton t-shirt, various sizes.', price: 25, group: ProductGroup.Clothing },
    { id: '5', name: 'Jeans', description: 'Classic blue jeans, comfortable fit.', price: 50, group: ProductGroup.Clothing },
    { id: '6', name: 'Sneakers', description: 'Stylish sneakers for everyday wear.', price: 80, group: ProductGroup.Clothing },
    // Books
    { id: '7', name: 'The Great Gatsby', description: 'Classic novel by F. Scott Fitzgerald.', price: 15, group: ProductGroup.Books },
    { id: '8', name: 'Clean Code', description: 'A Handbook of Agile Software Craftsmanship by Robert C. Martin.', price: 40, group: ProductGroup.Books },
    { id: '9', name: 'Atomic Habits', description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear.', price: 25, group: ProductGroup.Books },
  ];

  getProducts(): IProduct[] {
    return this.products;
  }

  getProductById(id: string): IProduct | undefined {
    return this.products.find(product => product.id === id);
  }

  getProductsByGroup(groupId: string): IProduct[] {
    return this.products.filter(product => product.group === groupId);
  }

  get productsGroups() {
    return this.products.reduce((groups: TProductGroups, product: IProduct): TProductGroups => {
      const type = product.group;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(product);
      return groups;
    }, {});
  }
}
