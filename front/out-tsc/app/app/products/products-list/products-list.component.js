import { __decorate, __metadata } from "tslib";
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { ProductsService } from '../products.service';
let ProductsListComponent = class ProductsListComponent {
    constructor() {
        this.products = signal([]);
        this.isLoading = signal(true);
        this.apiError = signal(false);
        this.productsService = inject(ProductsService);
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
ProductsListComponent = __decorate([
    Component({
        selector: 'app-products-list',
        standalone: true,
        imports: [CommonModule, RouterModule],
        templateUrl: './products-list.component.html',
        styleUrl: './products-list.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    }),
    __metadata("design:paramtypes", [])
], ProductsListComponent);
export { ProductsListComponent };
