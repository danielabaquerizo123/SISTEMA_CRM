import { Router } from "express";
import {
  createCliente,
  deleteCliente,
  getClienteById,
  getClientes,
  updateCliente,
} from "../controllers/clientesController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getClientes));
router.get("/:id", asyncHandler(getClienteById));
router.post("/", asyncHandler(createCliente));
router.put("/:id", asyncHandler(updateCliente));
router.delete("/:id", asyncHandler(deleteCliente));

export default router;
