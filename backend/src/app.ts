import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import apiRoutes from "./routes";

export const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRoutes);
app.use(errorHandler);
