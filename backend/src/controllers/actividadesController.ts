import { Request, Response } from "express";
import { AppError } from "../middlewares/AppError";
import { prisma } from "../prisma/client";
import { parseId, requirePositiveId, requireText } from "../utils/validators";

export async function getActividades(_req: Request, res: Response) {
  const actividades = await prisma.actividad.findMany({
    include: { cliente: true },
    orderBy: { fecha: "desc" },
  });

  res.json(actividades);
}

export async function createActividad(req: Request, res: Response) {
  const titulo = requireText(req.body.titulo, "titulo");
  const tipo = requireText(req.body.tipo, "tipo");
  const clienteId = requirePositiveId(req.body.clienteId, "clienteId");

  if (!req.body.fecha) {
    throw new AppError("El campo fecha es requerido", 400);
  }

  const fecha = new Date(req.body.fecha);

  if (Number.isNaN(fecha.getTime())) {
    throw new AppError("El campo fecha debe ser una fecha valida", 400);
  }

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });

  if (!cliente) {
    throw new AppError("No existe un cliente con el clienteId indicado", 404);
  }

  const actividad = await prisma.actividad.create({
    data: {
      titulo,
      tipo,
      fecha,
      clienteId,
    },
  });

  res.status(201).json(actividad);
}

export async function deleteActividad(req: Request, res: Response) {
  const id = parseId(req.params.id, "actividad");
  const currentActividad = await prisma.actividad.findUnique({ where: { id } });

  if (!currentActividad) {
    throw new AppError("Actividad no encontrada", 404);
  }

  await prisma.actividad.delete({ where: { id } });
  res.status(204).send();
}
