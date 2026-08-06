import { __decorate, __metadata } from "tslib";
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ProductsService } from './products.service';
let ProductsComponent = class ProductsComponent {
    constructor() {
        this.productsService = inject(ProductsService);
        this.products = signal([]);
        this.isLoading = signal(true);
        this.apiError = signal(false);
        this.loadProducts();
    }
    loadProducts() {
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
};
ProductsComponent = __decorate([
    Component({
        selector: 'app-products',
        standalone: true,
        templateUrl: './products.component.html',
        styleUrl: './products.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    }),
    __metadata("design:paramtypes", [])
], ProductsComponent);
export { ProductsComponent };
