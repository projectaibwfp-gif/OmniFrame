import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ProductsService, type Product } from '../products.service';
import { EMPTY_PRODUCT_FORM, type ProductFormValue, validateProductForm } from '../product-form';

@Component({
  selector: 'app-products-edit',
  imports: [FormsModule],
  templateUrl: './products-edit.component.html',
  styleUrl: './products-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsEditComponent {
  protected readonly product = signal<Product | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly validationErrors = signal<Record<string, string>>({});
  protected readonly editForm = signal<ProductFormValue>({ ...EMPTY_PRODUCT_FORM });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  constructor() {
    this.loadProduct();
  }

  protected saveProduct(): void {
    if (!this.validateForm()) {
      return;
    }

    const product = this.product();
    if (!product) {
      return;
    }

    this.isSaving.set(true);
    this.apiError.set(null);
    const form = this.editForm();

    this.productsService
      .updateProduct(product.id, {
        name: form.name,
        status: form.status,
        category: form.category,
        description: form.description || undefined,
      })
      .subscribe({
        next: (updated) => {
          this.product.set(updated);
          this.isSaving.set(false);
          void this.router.navigate(['/products', product.id]);
        },
        error: (error) => {
          console.error('Failed to update product:', error);
          this.apiError.set(
            error?.error?.message || 'Nie udało się zapisać zmian. Spróbuj ponownie.',
          );
          this.isSaving.set(false);
        },
      });
  }

  protected cancel(): void {
    const product = this.product();
    void this.router.navigate(product ? ['/products', product.id] : ['/products']);
  }

  private validateForm(): boolean {
    const errors = validateProductForm(this.editForm());
    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private loadProduct(): void {
    this.isLoading.set(true);
    this.apiError.set(null);

    this.route.params.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = Number.parseInt(params['id'], 10);
      if (Number.isNaN(id)) {
        this.apiError.set('Invalid product ID');
        this.isLoading.set(false);
        return;
      }

      this.productsService
        .getProduct(id)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (product) => {
            this.product.set(product);
            this.editForm.set({
              name: product.name,
              status: product.status,
              category: product.category,
              description: product.description || '',
            });
          },
          error: (error) => {
            console.error('Failed to load product:', error);
            this.apiError.set('Nie udało się pobrać produktu');
          },
        });
    });
  }
}
