import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AppDateTimePipe } from '../../core/date-time.pipe';
import { ProductsService, type Product } from '../products.service';

@Component({
  selector: 'app-products-list',
  imports: [RouterLink, AppDateTimePipe],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent {
  protected readonly products = signal<Product[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal(false);

  private readonly productsService = inject(ProductsService);

  constructor() {
    this.loadProducts();
  }

  protected loadProducts(): void {
    this.isLoading.set(true);
    this.apiError.set(false);
    this.productsService
      .getProducts()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (products) => this.products.set(products),
        error: () => this.apiError.set(true),
      });
  }
}
