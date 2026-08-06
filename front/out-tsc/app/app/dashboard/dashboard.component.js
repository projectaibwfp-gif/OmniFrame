import { __decorate, __metadata } from "tslib";
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
let DashboardComponent = class DashboardComponent {
    constructor() {
        this.http = inject(HttpClient);
        this.products = signal([]);
        this.isLoading = signal(true);
        this.apiError = signal(false);
        this.loadProducts();
    }
    loadProducts() {
        this.isLoading.set(true);
        this.apiError.set(false);
        this.http
            .get('/api/products')
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: ({ data }) => this.products.set(data),
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
