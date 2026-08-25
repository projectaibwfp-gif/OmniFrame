import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type {
  ApiResponse,
  ProductCreateRequestDto,
  ProductDto,
  ProductUpdateRequestDto,
} from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

export type Product = ProductDto;
type ProductsResponse = ApiResponse<ProductDto[]>;
type ProductResponse = ApiResponse<ProductDto>;
type CreateProductInput = ProductCreateRequestDto;
type UpdateProductInput = ProductUpdateRequestDto;

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

  createProduct(product: CreateProductInput): Observable<Product> {
    return this.http
      .post<ProductResponse>(buildApiUrl('/products'), product)
      .pipe(map((response) => response.data));
  }

  updateProduct(id: number, product: UpdateProductInput): Observable<Product> {
    return this.http
      .patch<ProductResponse>(buildApiUrl(`/products/${id}`), product)
      .pipe(map((response) => response.data));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/products/${id}`));
  }
}
