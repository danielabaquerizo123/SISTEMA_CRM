"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientes = getClientes;
exports.getClienteById = getClienteById;
exports.createCliente = createCliente;
exports.updateCliente = updateCliente;
exports.deleteCliente = deleteCliente;
const AppError_1 = require("../middlewares/AppError");
const client_1 = require("../prisma/client");
const validators_1 = require("../utils/validators");
async function getClientes(_req, res) {
    const clientes = await client_1.prisma.cliente.findMany({
        orderBy: { createdAt: "desc" },
    });
    res.json(clientes);
}
async function getClienteById(req, res) {
    const id = (0, validators_1.parseId)(req.params.id, "cliente");
    const cliente = await client_1.prisma.cliente.findUnique({
        where: { id },
        include: { oportunidades: true, actividades: true },
    });
    if (!cliente) {
        throw new AppError_1.AppError("Cliente no encontrado", 404);
    }
    res.json(cliente);
}
async function createCliente(req, res) {
    const nombre = (0, validators_1.requireText)(req.body.nombre, "nombre");
    const correo = (0, validators_1.requireText)(req.body.correo, "correo");
    const cliente = await client_1.prisma.cliente.create({
        data: {
            nombre,
            correo,
            telefono: req.body.telefono ?? null,
            empresa: req.body.empresa ?? null,
            estado: req.body.estado ?? undefined,
        },
    });
    res.status(201).json(cliente);
}
async function updateCliente(req, res) {
    const id = (0, validators_1.parseId)(req.params.id, "cliente");
    const currentCliente = await client_1.prisma.cliente.findUnique({ where: { id } });
    if (!currentCliente) {
        throw new AppError_1.AppError("Cliente no encontrado", 404);
    }
    const data = {
        nombre: req.body.nombre !== undefined ? (0, validators_1.requireText)(req.body.nombre, "nombre") : undefined,
        correo: req.body.correo !== undefined ? (0, validators_1.requireText)(req.body.correo, "correo") : undefined,
        telefono: req.body.telefono ?? undefined,
        empresa: req.body.empresa ?? undefined,
        estado: req.body.estado ?? undefined,
    };
    const cliente = await client_1.prisma.cliente.update({
        where: { id },
        data,
    });
    res.json(cliente);
}
async function deleteCliente(req, res) {
    const id = (0, validators_1.parseId)(req.params.id, "cliente");
    const currentCliente = await client_1.prisma.cliente.findUnique({ where: { id } });
    if (!currentCliente) {
        throw new AppError_1.AppError("Cliente no encontrado", 404);
    }
    await client_1.prisma.cliente.delete({ where: { id } });
    res.status(204).send();
}
