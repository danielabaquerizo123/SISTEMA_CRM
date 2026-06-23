import { Request, Response } from "express";
import { AppError } from "../middlewares/AppError";
import { prisma } from "../prisma/client";
import { parseId, requireText } from "../utils/validators";

export async function getClientes(_req: Request, res: Response) {
  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(clientes);
}

export async function getClienteById(req: Request, res: Response) {
  const id = parseId(req.params.id, "cliente");
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { oportunidades: true, actividades: true },
  });

  if (!cliente) {
    throw new AppError("Cliente no encontrado", 404);
  }

  res.json(cliente);
}

export async function createCliente(req: Request, res: Response) {
  const nombre = requireText(req.body.nombre, "nombre");
  const correo = requireText(req.body.correo, "correo");

  const cliente = await prisma.cliente.create({
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

export async function updateCliente(req: Request, res: Response) {
  const id = parseId(req.params.id, "cliente");
  const currentCliente = await prisma.cliente.findUnique({ where: { id } });

  if (!currentCliente) {
    throw new AppError("Cliente no encontrado", 404);
  }

  const data = {
    nombre: req.body.nombre !== undefined ? requireText(req.body.nombre, "nombre") : undefined,
    correo: req.body.correo !== undefined ? requireText(req.body.correo, "correo") : undefined,
    telefono: req.body.telefono ?? undefined,
    empresa: req.body.empresa ?? undefined,
    estado: req.body.estado ?? undefined,
  };

  const cliente = await prisma.cliente.update({
    where: { id },
    data,
  });

  res.json(cliente);
}

export async function deleteCliente(req: Request, res: Response) {
  const id = parseId(req.params.id, "cliente");
  const currentCliente = await prisma.cliente.findUnique({ where: { id } });

  if (!currentCliente) {
    throw new AppError("Cliente no encontrado", 404);
  }

  await prisma.cliente.delete({ where: { id } });
  res.status(204).send();
}
