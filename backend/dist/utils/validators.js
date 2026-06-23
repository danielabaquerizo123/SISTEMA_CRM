"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireText = requireText;
exports.parseId = parseId;
exports.requirePositiveId = requirePositiveId;
exports.requireNumber = requireNumber;
const AppError_1 = require("../middlewares/AppError");
function requireText(value, field) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new AppError_1.AppError(`El campo ${field} es requerido`, 400);
    }
    return value.trim();
}
function parseId(value, resource = "registro") {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError_1.AppError(`ID de ${resource} invalido`, 400);
    }
    return id;
}
function requirePositiveId(value, field) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError_1.AppError(`El campo ${field} es requerido`, 400);
    }
    return id;
}
function requireNumber(value, field) {
    const numberValue = Number(value);
    if (value === null || value === undefined || value === "" || Number.isNaN(numberValue)) {
        throw new AppError_1.AppError(`El campo ${field} es requerido`, 400);
    }
    return numberValue;
}
