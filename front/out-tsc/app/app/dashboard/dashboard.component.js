import { __decorate, __metadata } from "tslib";
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ProductsService } from '../products/products.service';
let DashboardComponent = class DashboardComponent {
    constructor() {
        this.products = signal([]);
        this.isLoading = signal(true);
        this.apiError = signal(false);
        this.currentUser = inject(AuthService).user;
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
DashboardComponent = __decorate([
    Component({
        selector: 'app-dashboard',
        standalone: true,
        imports: [RouterLink],
        templateUrl: './dashboard.component.html',
        styleUrl: './dashboard.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    }),
    __metadata("design:paramtypes", [])
], DashboardComponent);
export { DashboardComponent };
