import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../products.service';
import { EMPTY_PRODUCT_FORM, type ProductFormValue, validateProductForm } from '../product-form';

@Component({
  selector: 'app-products-create',
  imports: [FormsModule],
  templateUrl: './products-create.component.html',
  styleUrl: './products-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCreateComponent {
  protected readonly isSaving = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly validationErrors = signal<Record<string, string>>({});
  protected readonly createForm = signal<ProductFormValue>({ ...EMPTY_PRODUCT_FORM });

  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  protected createProduct(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving.set(true);
    this.apiError.set(null);
    const form = this.createForm();

    this.productsService
      .createProduct({
        name: form.name,
        status: form.status,
        category: form.category,
        description: form.description || undefined,
      })
      .subscribe({
        next: (product) => {
          this.isSaving.set(false);
          void this.router.navigate(['/products', product.id]);
        },
        error: (error) => {
          console.error('Failed to create product:', error);
          this.apiError.set(
            error?.error?.message || 'Nie udało się utworzyć produktu. Spróbuj ponownie.',
          );
          this.isSaving.set(false);
        },
      });
  }

  protected cancel(): void {
    void this.router.navigate(['/products']);
  }

  private validateForm(): boolean {
    const errors = validateProductForm(this.createForm());
    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }
}
