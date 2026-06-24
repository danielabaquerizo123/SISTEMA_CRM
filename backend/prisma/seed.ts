import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

async function main() {
  await prisma.actividad.deleteMany();
  await prisma.oportunidad.deleteMany();
  await prisma.cliente.deleteMany();

  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nombre: "Ana Martinez",
        correo: "ana.martinez@northstar.edu",
        telefono: "0991234567",
        empresa: "Northstar Academy",
        estado: "activo",
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Carlos Rivera",
        correo: "carlos.rivera@edupro.com",
        telefono: "0987654321",
        empresa: "EduPro Latam",
        estado: "activo",
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Lucia Herrera",
        correo: "lucia.herrera@brightcampus.com",
        telefono: "0978881122",
        empresa: "Bright Campus",
        estado: "activo",
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Miguel Torres",
        correo: "miguel.torres@skillhub.ec",
        telefono: "0963332211",
        empresa: "SkillHub Ecuador",
        estado: "activo",
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Sofia Delgado",
        correo: "sofia.delgado@aula360.com",
        telefono: "0954567890",
        empresa: "Aula 360",
        estado: "activo",
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Diego Almeida",
        correo: "diego.almeida@talentbridge.io",
        telefono: "0947776655",
        empresa: "Talent Bridge",
        estado: "inactivo",
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Valentina Rojas",
        correo: "valentina.rojas@campusplus.org",
        telefono: "0931112233",
        empresa: "Campus Plus",
        estado: "activo",
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: "Javier Molina",
        correo: "javier.molina@learncraft.co",
        telefono: "0922223344",
        empresa: "LearnCraft",
        estado: "inactivo",
      },
    }),
  ]);

  const oportunidadesData = [
    ["Programa onboarding docente", "prospecto", 1200, 0],
    ["Licencias plataforma LMS", "prospecto", 7800, 1],
    ["Capacitacion comercial academica", "contactado", 2400, 2],
    ["Implementacion CRM educativo", "contactado", 9500, 3],
    ["Consultoria de admisiones", "negociacion", 4200, 4],
    ["Automatizacion de seguimiento", "negociacion", 6800, 0],
    ["Migracion de base estudiantil", "negociacion", 15000, 6],
    ["Plan anual de soporte", "ganado", 5200, 1],
    ["Entrenamiento equipo ventas", "ganado", 3100, 2],
    ["Analitica para retencion", "ganado", 11200, 4],
    ["Renovacion paquete legacy", "perdido", 900, 5],
    ["Proyecto portal egresados", "perdido", 13500, 7],
  ] as const;

  await Promise.all(
    oportunidadesData.map(([titulo, estado, valor, clienteIndex]) =>
      prisma.oportunidad.create({
        data: {
          titulo,
          descripcion: `Oportunidad para ${clientes[clienteIndex].empresa}.`,
          valor,
          estado,
          clienteId: clientes[clienteIndex].id,
        },
      })
    )
  );

  const actividadesData = [
    ["Llamada inicial con direccion academica", "llamada", 1, 0],
    ["Reunion de levantamiento", "reunion", 2, 1],
    ["Seguimiento propuesta LMS", "seguimiento", 3, 1],
    ["Demo del flujo Kanban", "reunion", 4, 3],
    ["Llamada sobre presupuesto", "llamada", 5, 4],
    ["Revision de contrato", "seguimiento", 6, 2],
    ["Reunion con rectorado", "reunion", 8, 6],
    ["Seguimiento de renovacion", "seguimiento", 9, 5],
    ["Llamada de cierre", "llamada", 12, 0],
    ["Revision de integraciones", "reunion", 14, 7],
  ] as const;

  await Promise.all(
    actividadesData.map(([titulo, tipo, days, clienteIndex]) =>
      prisma.actividad.create({
        data: {
          titulo,
          tipo,
          fecha: daysAgo(days),
          clienteId: clientes[clienteIndex].id,
        },
      })
    )
  );

  const [clientesCount, oportunidadesCount, actividadesCount] = await Promise.all([
    prisma.cliente.count(),
    prisma.oportunidad.count(),
    prisma.actividad.count(),
  ]);

  console.log(
    `Seed completado: ${clientesCount} clientes, ${oportunidadesCount} oportunidades, ${actividadesCount} actividades.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
