import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ProductsService, type Product } from '../products/products.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(true);
  readonly apiError = signal(false);
  readonly currentUser = inject(AuthService).user;

  private readonly productsService = inject(ProductsService);

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
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
