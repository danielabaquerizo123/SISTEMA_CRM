# CRM Académico

Este es un proyecto de CRM académico construido con React (Frontend) y Express/Prisma/PostgreSQL (Backend).

## Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [PostgreSQL](https://www.postgresql.org/) corriendo en su entorno local o remoto.

## Estructura del Proyecto

- `frontend/`: Aplicación React + Vite + TypeScript + TailwindCSS.
- `backend/`: API Express + TypeScript + Prisma.

---

## Configuración y Ejecución

### 1. Backend

1. Navegar a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instalar dependencias (si no se han instalado):
   ```bash
   npm install
   ```
3. Configurar las variables de entorno:
   - Duplicar el archivo `.env.example` y renombrarlo a `.env`.
   - Modificar la variable `DATABASE_URL` con las credenciales correctas de su base de datos PostgreSQL.
4. Generar el cliente de Prisma:
   ```bash
   npx prisma generate
   ```
5. Correr las migraciones para crear las tablas en la base de datos:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Iniciar el servidor de desarrollo del backend:
   ```bash
   npm run dev
   ```
   El servidor backend correrá en `http://localhost:3000` (o el puerto configurado en su `.env`).

---

### 2. Frontend

1. Navegar a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instalar dependencias (si no se han instalado):
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   La aplicación frontend estará disponible en `http://localhost:5173`.
