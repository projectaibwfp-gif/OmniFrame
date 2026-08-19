import { __decorate } from "tslib";
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../products.service';
let ProductsEditComponent = class ProductsEditComponent {
    constructor() {
        this.route = inject(ActivatedRoute);
        this.productsService = inject(ProductsService);
    }
};
ProductsEditComponent = __decorate([
    Component({
        selector: 'app-products-edit',
        standalone: true,
        imports: [CommonModule, FormsModule],
        templateUrl: './products-edit.component.html',
        styleUrl: './products-edit.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
], ProductsEditComponent);
export { ProductsEditComponent };
