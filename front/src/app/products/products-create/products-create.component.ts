import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-products-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-create.component.html',
  styleUrl: './products-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCreateComponent {
  readonly isSaving = signal(false);
  readonly apiError = signal<string | null>(null);
  readonly validationErrors = signal<Record<string, string>>({});

  readonly createForm = signal({
    name: '',
    status: 'draft' as 'active' | 'draft',
    category: 'General',
    description: '',
  });

  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const form = this.createForm();

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

  createProduct(): void {
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
          this.router.navigate(['/products', product.id]);
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

  cancel(): void {
    this.router.navigate(['/products']);
  }
}

