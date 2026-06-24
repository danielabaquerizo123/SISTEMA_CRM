import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import apiRoutes from "./routes";

export const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://sunny-forgiveness-production-730f.up.railway.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  }
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRoutes);
app.use(errorHandler);