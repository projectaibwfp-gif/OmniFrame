import type { ProductStatus } from '@shared/api-contract';

export const PRODUCT_NAME_MAX_LENGTH = 120;
export const PRODUCT_CATEGORY_MAX_LENGTH = 80;
export const PRODUCT_DESCRIPTION_MAX_LENGTH = 500;

export const PRODUCT_STATUSES: readonly ProductStatus[] = ['active', 'draft'];

export interface ProductFormValue {
  name: string;
  status: ProductStatus;
  category: string;
  description: string;
}

export const EMPTY_PRODUCT_FORM: ProductFormValue = {
  name: '',
  status: 'draft',
  category: 'General',
  description: '',
};

export function validateProductForm(form: ProductFormValue): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = form.name.trim();
  if (!name || name.length > PRODUCT_NAME_MAX_LENGTH) {
    errors['name'] =
      `Nazwa jest wymagana i nie może być dłuższa niż ${PRODUCT_NAME_MAX_LENGTH} znaków`;
  }

  if (!PRODUCT_STATUSES.includes(form.status)) {
    errors['status'] = 'Nieprawidłowy status';
  }

  const category = form.category.trim();
  if (!category || category.length > PRODUCT_CATEGORY_MAX_LENGTH) {
    errors['category'] =
      `Kategoria jest wymagana i nie może być dłuższa niż ${PRODUCT_CATEGORY_MAX_LENGTH} znaków`;
  }

  if (form.description && form.description.length > PRODUCT_DESCRIPTION_MAX_LENGTH) {
    errors['description'] =
      `Opis nie może być dłuższy niż ${PRODUCT_DESCRIPTION_MAX_LENGTH} znaków`;
  }

  return errors;
}
