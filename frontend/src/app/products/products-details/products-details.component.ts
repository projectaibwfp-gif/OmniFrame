import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AppDateTimePipe } from '../../core/date-time.pipe';
import { ProductsService, type Product } from '../products.service';

@Component({
  selector: 'app-products-details',
  imports: [AppDateTimePipe],
  templateUrl: './products-details.component.html',
  styleUrl: './products-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsDetailsComponent {
  protected readonly product = signal<Product | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  constructor() {
    this.loadProduct();
  }

  protected goBack(): void {
    void this.router.navigate(['/products']);
  }

  protected goEdit(): void {
    const product = this.product();
    if (product) {
      void this.router.navigate(['/products', product.id, 'edit']);
    }
  }

  private loadProduct(): void {
    this.isLoading.set(true);
    this.apiError.set(null);

    this.route.params.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = Number.parseInt(params['id'], 10);
      if (Number.isNaN(id)) {
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
}
