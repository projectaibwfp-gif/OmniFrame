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
};
ProductsService = __decorate([
    Injectable({ providedIn: 'root' })
], ProductsService);
export { ProductsService };
