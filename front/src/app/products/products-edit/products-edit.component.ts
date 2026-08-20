import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ProductsService, type Product } from '../products.service';

@Component({
  selector: 'app-products-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-edit.component.html',
  styleUrl: './products-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsEditComponent {
  readonly product = signal<Product | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly apiError = signal<string | null>(null);
  readonly validationErrors = signal<Record<string, string>>({});

  readonly editForm = signal({
    name: '',
    status: 'draft' as 'active' | 'draft',
    category: 'General',
    description: '',
  });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  constructor() {
    this.loadProduct();
  }

  saveProduct(): void {
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
          this.router.navigate(['/products', product.id]);
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

  cancel(): void {
    const product = this.product();
    if (product) {
      this.router.navigate(['/products', product.id]);
    } else {
      this.router.navigate(['/products']);
    }
  }

  private validateForm(): boolean {
    const errors: Record<string, string> = {};
    const form = this.editForm();

    const name = form.name.trim();
    if (!name || name.length > 120) {
      errors['name'] = 'Nazwa jest wymagana i nie może być dłuższa niż 120 znaków';
    }

    if (!['active', 'draft'].includes(form.status)) {
      errors['status'] = 'Nieprawidłowy status';
    }

    const category = form.category.trim();
    if (!category || category.length > 80) {
      errors['category'] = 'Kategoria jest wymagana i nie może być dłuższa niż 80 znaków';
    }

    if (form.description && form.description.length > 500) {
      errors['description'] = 'Opis nie może być dłuższy niż 500 znaków';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private loadProduct(): void {
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
