import { __decorate, __metadata } from "tslib";
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ProductsService } from '../products.service';
let ProductsDetailsComponent = class ProductsDetailsComponent {
    constructor() {
        this.product = signal(null);
        this.isLoading = signal(true);
        this.apiError = signal(null);
        this.route = inject(ActivatedRoute);
        this.router = inject(Router);
        this.productsService = inject(ProductsService);
        this.loadProduct();
    }
    loadProduct() {
        this.isLoading.set(true);
        this.apiError.set(null);
        this.route.params.subscribe((params) => {
            const id = parseInt(params['id'], 10);
            if (isNaN(id)) {
                this.apiError.set('Invalid product ID');
                this.isLoading.set(false);
                return;
            }
            this.productsService
                .getProduct(id)
                .pipe(finalize(() => this.isLoading.set(false)))
                .subscribe({
                next: (product) => this.product.set(product),
                error: (error) => {
                    console.error('Failed to load product:', error);
                    this.apiError.set('Nie udało się pobrać szczegółów produktu');
                },
            });
        });
    }
    goBack() {
        this.router.navigate(['/products']);
    }
    goEdit() {
        const product = this.product();
        if (product) {
            this.router.navigate(['/products', product.id, 'edit']);
        }
    }
};
ProductsDetailsComponent = __decorate([
    Component({
        selector: 'app-products-details',
        standalone: true,
        imports: [CommonModule, RouterModule],
        templateUrl: './products-details.component.html',
        styleUrl: './products-details.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    }),
    __metadata("design:paramtypes", [])
], ProductsDetailsComponent);
export { ProductsDetailsComponent };
