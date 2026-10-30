import { AppError } from '../app/errors.js';

export function normalizeProjectName(name: string): string {
  return name
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function validateProjectName(name: unknown): string {
  if (typeof name !== 'string') {
    throw new AppError(400, 'El nombre del proyecto es obligatorio');
  }

  const trimmedName = name.trim();
  const length = [...trimmedName].length;
  if (length < 3 || length > 100) {
    throw new AppError(
      400,
      'El nombre del proyecto debe tener entre 3 y 100 caracteres',
    );
  }

  return trimmedName;
}

export function validateProjectDescription(
  description: unknown,
): string | null {
  if (description === undefined || description === null) {
    return null;
  }
  if (typeof description !== 'string' || [...description].length > 500) {
    throw new AppError(
      400,
      'La descripción del proyecto no puede superar 500 caracteres',
    );
  }
  return description;
}
