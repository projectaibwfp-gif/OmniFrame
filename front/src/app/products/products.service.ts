import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { buildApiUrl } from '../config/api.config';

export interface Product {
  id: number;
  name: string;
  status: 'active' | 'draft';
  category: string;
  updatedAt: string;
}

interface ProductsResponse {
  data: Product[];
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http
      .get<ProductsResponse>(buildApiUrl('/products'))
      .pipe(map((response) => response.data));
  }
}
