"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOportunidades = getOportunidades;
exports.getOportunidadById = getOportunidadById;
exports.createOportunidad = createOportunidad;
exports.updateOportunidad = updateOportunidad;
exports.updateEstadoOportunidad = updateEstadoOportunidad;
exports.deleteOportunidad = deleteOportunidad;
const client_1 = require("@prisma/client");
const AppError_1 = require("../middlewares/AppError");
const client_2 = require("../prisma/client");
const validators_1 = require("../utils/validators");
async function ensureClienteExists(clienteId) {
    const cliente = await client_2.prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) {
        throw new AppError_1.AppError("No existe un cliente con el clienteId indicado", 404);
    }
}
async function getOportunidades(_req, res) {
    const oportunidades = await client_2.prisma.oportunidad.findMany({
        include: { cliente: true },
        orderBy: { createdAt: "desc" },
    });
    res.json(oportunidades);
}
async function getOportunidadById(req, res) {
    const id = (0, validators_1.parseId)(req.params.id, "oportunidad");
    const oportunidad = await client_2.prisma.oportunidad.findUnique({
        where: { id },
        include: { cliente: true },
    });
    if (!oportunidad) {
        throw new AppError_1.AppError("Oportunidad no encontrada", 404);
    }
    res.json(oportunidad);
}
async function createOportunidad(req, res) {
    const titulo = (0, validators_1.requireText)(req.body.titulo, "titulo");
    const valor = (0, validators_1.requireNumber)(req.body.valor, "valor");
    const clienteId = (0, validators_1.requirePositiveId)(req.body.clienteId, "clienteId");
    await ensureClienteExists(clienteId);
    const oportunidad = await client_2.prisma.oportunidad.create({
        data: {
            titulo,
            descripcion: req.body.descripcion ?? null,
            valor: new client_1.Prisma.Decimal(valor),
            estado: req.body.estado ?? undefined,
            clienteId,
        },
    });
    res.status(201).json(oportunidad);
}
async function updateOportunidad(req, res) {
    const id = (0, validators_1.parseId)(req.params.id, "oportunidad");
    const currentOportunidad = await client_2.prisma.oportunidad.findUnique({ where: { id } });
    if (!currentOportunidad) {
        throw new AppError_1.AppError("Oportunidad no encontrada", 404);
    }
    const clienteId = req.body.clienteId !== undefined ? (0, validators_1.requirePositiveId)(req.body.clienteId, "clienteId") : undefined;
    if (clienteId !== undefined) {
        await ensureClienteExists(clienteId);
    }
    const data = {
        titulo: req.body.titulo !== undefined ? (0, validators_1.requireText)(req.body.titulo, "titulo") : undefined,
        descripcion: req.body.descripcion ?? undefined,
        valor: req.body.valor !== undefined ? new client_1.Prisma.Decimal((0, validators_1.requireNumber)(req.body.valor, "valor")) : undefined,
        estado: req.body.estado ?? undefined,
        clienteId,
    };
    const oportunidad = await client_2.prisma.oportunidad.update({
        where: { id },
        data,
    });
    res.json(oportunidad);
}
async function updateEstadoOportunidad(req, res) {
    const id = (0, validators_1.parseId)(req.params.id, "oportunidad");
    const estado = (0, validators_1.requireText)(req.body.estado, "estado");
    const currentOportunidad = await client_2.prisma.oportunidad.findUnique({ where: { id } });
    if (!currentOportunidad) {
        throw new AppError_1.AppError("Oportunidad no encontrada", 404);
    }
    const oportunidad = await client_2.prisma.oportunidad.update({
        where: { id },
        data: { estado },
    });
    res.json(oportunidad);
}
async function deleteOportunidad(req, res) {
    const id = (0, validators_1.parseId)(req.params.id, "oportunidad");
    const currentOportunidad = await client_2.prisma.oportunidad.findUnique({ where: { id } });
    if (!currentOportunidad) {
        throw new AppError_1.AppError("Oportunidad no encontrada", 404);
    }
    await client_2.prisma.oportunidad.delete({ where: { id } });
    res.status(204).send();
}
