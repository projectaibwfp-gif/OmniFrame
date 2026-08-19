import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { buildApiUrl } from '../config/api.config';

export interface Product {
  id: number;
  name: string;
  status: 'active' | 'draft';
  category: string;
  description?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  data: Product[];
}

interface ProductResponse {
  data: Product;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http
      .get<ProductsResponse>(buildApiUrl('/products'))
      .pipe(map((response) => response.data));
  }

  getProduct(id: number): Observable<Product> {
    return this.http
      .get<ProductResponse>(buildApiUrl(`/products/${id}`))
      .pipe(map((response) => response.data));
  }

  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
    return this.http
      .post<ProductResponse>(buildApiUrl('/products'), product)
      .pipe(map((response) => response.data));
  }

  updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'createdAt' | 'createdBy'>>): Observable<Product> {
    return this.http
      .patch<ProductResponse>(buildApiUrl(`/products/${id}`), product)
      .pipe(map((response) => response.data));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/products/${id}`));
  }
}
