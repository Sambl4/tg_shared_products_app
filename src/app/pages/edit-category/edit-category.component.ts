import id from '@angular/common/locales/id';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-edit-category.component',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './edit-category.component.html',
  styleUrl: './edit-category.component.css'
})
export class EditCategoryComponent {
  route = inject(ActivatedRoute);
  productService = inject(ProductService);
  
  id = this.route.snapshot.paramMap.get('id') || '';
  products = this.productService.getProductsByCategoryId(this.id);
  categoriesList = this.productService.getProductsCategories();

    // this.product = this.productService.getProductById(+id) || null;
}
