import { Router } from "express";
import {
  createOportunidad,
  deleteOportunidad,
  getOportunidadById,
  getOportunidades,
  updateEstadoOportunidad,
  updateOportunidad,
} from "../controllers/oportunidadesController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getOportunidades));
router.get("/:id", asyncHandler(getOportunidadById));
router.post("/", asyncHandler(createOportunidad));
router.put("/:id", asyncHandler(updateOportunidad));
router.patch("/:id/estado", asyncHandler(updateEstadoOportunidad));
router.delete("/:id", asyncHandler(deleteOportunidad));

export default router;
