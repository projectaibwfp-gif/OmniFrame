import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ProductsService, type Product } from '../products.service';

@Component({
  selector: 'app-products-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products-details.component.html',
  styleUrl: './products-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsDetailsComponent {
  readonly product = signal<Product | null>(null);
  readonly isLoading = signal(true);
  readonly apiError = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  constructor() {
    this.loadProduct();
  }

  private loadProduct(): void {
    this.isLoading.set(true);
    this.apiError.set(null);

    this.route.params.subscribe((params) => {
      const id = parseInt(params['id'], 10);
      if (isNaN(id)) {
        this.apiError.set('Invalid product ID');
        this.isLoading.set(false);
        return;
      }

      this.productsService
        .getProduct(id)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (product) => this.product.set(product),
          error: (error) => {
            console.error('Failed to load product:', error);
            this.apiError.set('Nie udało się pobrać szczegółów produktu');
          },
        });
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  goEdit(): void {
    const product = this.product();
    if (product) {
      this.router.navigate(['/products', product.id, 'edit']);
    }
  }
}

