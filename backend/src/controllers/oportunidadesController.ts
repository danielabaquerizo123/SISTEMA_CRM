import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { AppError } from "../middlewares/AppError";
import { prisma } from "../prisma/client";
import { parseId, requireNumber, requirePositiveId, requireText } from "../utils/validators";

async function ensureClienteExists(clienteId: number) {
  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });

  if (!cliente) {
    throw new AppError("No existe un cliente con el clienteId indicado", 404);
  }
}

export async function getOportunidades(_req: Request, res: Response) {
  const oportunidades = await prisma.oportunidad.findMany({
    include: { cliente: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(oportunidades);
}

export async function getOportunidadById(req: Request, res: Response) {
  const id = parseId(req.params.id, "oportunidad");
  const oportunidad = await prisma.oportunidad.findUnique({
    where: { id },
    include: { cliente: true },
  });

  if (!oportunidad) {
    throw new AppError("Oportunidad no encontrada", 404);
  }

  res.json(oportunidad);
}

export async function createOportunidad(req: Request, res: Response) {
  const titulo = requireText(req.body.titulo, "titulo");
  const valor = requireNumber(req.body.valor, "valor");
  const clienteId = requirePositiveId(req.body.clienteId, "clienteId");

  await ensureClienteExists(clienteId);

  const oportunidad = await prisma.oportunidad.create({
    data: {
      titulo,
      descripcion: req.body.descripcion ?? null,
      valor: new Prisma.Decimal(valor),
      estado: req.body.estado ?? undefined,
      clienteId,
    },
  });

  res.status(201).json(oportunidad);
}

export async function updateOportunidad(req: Request, res: Response) {
  const id = parseId(req.params.id, "oportunidad");
  const currentOportunidad = await prisma.oportunidad.findUnique({ where: { id } });

  if (!currentOportunidad) {
    throw new AppError("Oportunidad no encontrada", 404);
  }

  const clienteId =
    req.body.clienteId !== undefined ? requirePositiveId(req.body.clienteId, "clienteId") : undefined;

  if (clienteId !== undefined) {
    await ensureClienteExists(clienteId);
  }

  const data = {
    titulo: req.body.titulo !== undefined ? requireText(req.body.titulo, "titulo") : undefined,
    descripcion: req.body.descripcion ?? undefined,
    valor: req.body.valor !== undefined ? new Prisma.Decimal(requireNumber(req.body.valor, "valor")) : undefined,
    estado: req.body.estado ?? undefined,
    clienteId,
  };

  const oportunidad = await prisma.oportunidad.update({
    where: { id },
    data,
  });

  res.json(oportunidad);
}

export async function updateEstadoOportunidad(req: Request, res: Response) {
  const id = parseId(req.params.id, "oportunidad");
  const estado = requireText(req.body.estado, "estado");
  const currentOportunidad = await prisma.oportunidad.findUnique({ where: { id } });

  if (!currentOportunidad) {
    throw new AppError("Oportunidad no encontrada", 404);
  }

  const oportunidad = await prisma.oportunidad.update({
    where: { id },
    data: { estado },
  });

  res.json(oportunidad);
}

export async function deleteOportunidad(req: Request, res: Response) {
  const id = parseId(req.params.id, "oportunidad");
  const currentOportunidad = await prisma.oportunidad.findUnique({ where: { id } });

  if (!currentOportunidad) {
    throw new AppError("Oportunidad no encontrada", 404);
  }

  await prisma.oportunidad.delete({ where: { id } });
  res.status(204).send();
}
