import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService, type Product } from '../products.service';

@Component({
  selector: 'app-products-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-create.component.html',
  styleUrl: './products-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCreateComponent {
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
}
