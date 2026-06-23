"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActividades = getActividades;
exports.createActividad = createActividad;
exports.deleteActividad = deleteActividad;
const AppError_1 = require("../middlewares/AppError");
const client_1 = require("../prisma/client");
const validators_1 = require("../utils/validators");
async function getActividades(_req, res) {
    const actividades = await client_1.prisma.actividad.findMany({
        include: { cliente: true },
        orderBy: { fecha: "desc" },
    });
    res.json(actividades);
}
async function createActividad(req, res) {
    const titulo = (0, validators_1.requireText)(req.body.titulo, "titulo");
    const tipo = (0, validators_1.requireText)(req.body.tipo, "tipo");
    const clienteId = (0, validators_1.requirePositiveId)(req.body.clienteId, "clienteId");
    if (!req.body.fecha) {
        throw new AppError_1.AppError("El campo fecha es requerido", 400);
    }
    const fecha = new Date(req.body.fecha);
    if (Number.isNaN(fecha.getTime())) {
        throw new AppError_1.AppError("El campo fecha debe ser una fecha valida", 400);
    }
    const cliente = await client_1.prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) {
        throw new AppError_1.AppError("No existe un cliente con el clienteId indicado", 404);
    }
    const actividad = await client_1.prisma.actividad.create({
        data: {
            titulo,
            tipo,
            fecha,
            clienteId,
        },
    });
    res.status(201).json(actividad);
}
async function deleteActividad(req, res) {
    const id = (0, validators_1.parseId)(req.params.id, "actividad");
    const currentActividad = await client_1.prisma.actividad.findUnique({ where: { id } });
    if (!currentActividad) {
        throw new AppError_1.AppError("Actividad no encontrada", 404);
    }
    await client_1.prisma.actividad.delete({ where: { id } });
    res.status(204).send();
}
