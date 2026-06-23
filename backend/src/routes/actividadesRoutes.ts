import { Router } from "express";
import {
  createActividad,
  deleteActividad,
  getActividades,
} from "../controllers/actividadesController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getActividades));
router.post("/", asyncHandler(createActividad));
router.delete("/:id", asyncHandler(deleteActividad));

export default router;
