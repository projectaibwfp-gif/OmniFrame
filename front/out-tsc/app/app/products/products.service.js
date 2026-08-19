import { __decorate } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { buildApiUrl } from '../config/api.config';
let ProductsService = class ProductsService {
    constructor() {
        this.http = inject(HttpClient);
    }
    getProducts() {
        return this.http
            .get(buildApiUrl('/products'))
            .pipe(map((response) => response.data));
    }
    getProduct(id) {
        return this.http
            .get(buildApiUrl(`/products/${id}`))
            .pipe(map((response) => response.data));
    }
    createProduct(product) {
        return this.http
            .post(buildApiUrl('/products'), product)
            .pipe(map((response) => response.data));
    }
    updateProduct(id, product) {
        return this.http
            .patch(buildApiUrl(`/products/${id}`), product)
            .pipe(map((response) => response.data));
    }
    deleteProduct(id) {
        return this.http.delete(buildApiUrl(`/products/${id}`));
    }
};
ProductsService = __decorate([
    Injectable({ providedIn: 'root' })
], ProductsService);
export { ProductsService };
