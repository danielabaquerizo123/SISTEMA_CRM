import { AppError } from "../middlewares/AppError";

export function requireText(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(`El campo ${field} es requerido`, 400);
  }

  return value.trim();
}

export function parseId(value: string, resource = "registro") {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`ID de ${resource} invalido`, 400);
  }

  return id;
}

export function requirePositiveId(value: unknown, field: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`El campo ${field} es requerido`, 400);
  }

  return id;
}

export function requireNumber(value: unknown, field: string) {
  const numberValue = Number(value);

  if (value === null || value === undefined || value === "" || Number.isNaN(numberValue)) {
    throw new AppError(`El campo ${field} es requerido`, 400);
  }

  return numberValue;
}
