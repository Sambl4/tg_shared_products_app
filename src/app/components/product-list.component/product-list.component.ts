import { Component, Input } from '@angular/core';
import { IProduct } from '../../services/product.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  @Input() groupName: string = '';
  @Input() products: IProduct[] = [];

  constructor() {
  }

  ngOnInit() {
  }
}
