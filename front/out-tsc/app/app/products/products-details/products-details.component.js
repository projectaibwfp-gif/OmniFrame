import { __decorate } from "tslib";
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../products.service';
let ProductsDetailsComponent = class ProductsDetailsComponent {
    constructor() {
        this.route = inject(ActivatedRoute);
        this.productsService = inject(ProductsService);
    }
};
ProductsDetailsComponent = __decorate([
    Component({
        selector: 'app-products-details',
        standalone: true,
        imports: [CommonModule, FormsModule],
        templateUrl: './products-details.component.html',
        styleUrl: './products-details.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
], ProductsDetailsComponent);
export { ProductsDetailsComponent };
