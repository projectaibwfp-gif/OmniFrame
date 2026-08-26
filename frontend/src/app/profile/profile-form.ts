export const PHONE_MIN_DIGITS = 9;
export const MIN_AGE_YEARS = 13;
export const DESCRIPTION_MAX_LENGTH = 500;
export const PHONE_ALLOWED_CHARACTERS = /^[\d\s+\-()]+$/;

export interface ProfileEditForm {
  phone: string;
  birthDate: string;
  description: string;
}

export const EMPTY_PROFILE_FORM: ProfileEditForm = {
  phone: '',
  birthDate: '',
  description: '',
};

export function validateProfileForm(form: ProfileEditForm): Record<string, string> {
  const errors: Record<string, string> = {};

  if (form.phone) {
    if (!PHONE_ALLOWED_CHARACTERS.test(form.phone)) {
      errors['phone'] = 'Numer telefonu zawiera niedozwolone znaki';
    } else if (form.phone.replace(/\D/g, '').length < PHONE_MIN_DIGITS) {
      errors['phone'] = `Numer telefonu musi mieć co najmniej ${PHONE_MIN_DIGITS} cyfr`;
    }
  }

  if (form.birthDate) {
    const date = new Date(form.birthDate);
    const today = new Date();
    if (Number.isNaN(date.getTime())) {
      errors['birthDate'] = 'Nieprawidłowa data';
    } else if (date > today) {
      errors['birthDate'] = 'Data nie może być w przyszłości';
    } else if (today.getFullYear() - date.getFullYear() < MIN_AGE_YEARS) {
      errors['birthDate'] = `Musisz mieć co najmniej ${MIN_AGE_YEARS} lat`;
    }
  }

  if (form.description && form.description.length > DESCRIPTION_MAX_LENGTH) {
    errors['description'] = `Opis nie może być dłuższy niż ${DESCRIPTION_MAX_LENGTH} znaków`;
  }

  return errors;
}
