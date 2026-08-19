import { __decorate } from "tslib";
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../products.service';
let ProductsCreateComponent = class ProductsCreateComponent {
    constructor() {
        this.router = inject(Router);
        this.productsService = inject(ProductsService);
    }
};
ProductsCreateComponent = __decorate([
    Component({
        selector: 'app-products-create',
        standalone: true,
        imports: [CommonModule, FormsModule],
        templateUrl: './products-create.component.html',
        styleUrl: './products-create.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
], ProductsCreateComponent);
export { ProductsCreateComponent };
