import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

interface Product {
  id: number;
  name: string;
  status: 'active' | 'draft';
  category: string;
  updatedAt: string;
}

interface ProductsResponse {
  data: Product[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly http = inject(HttpClient);

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(true);
  readonly apiError = signal(false);

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.apiError.set(false);
    this.http
      .get<ProductsResponse>('/api/products')
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ data }) => this.products.set(data),
        error: () => this.apiError.set(true),
      });
  }
}
