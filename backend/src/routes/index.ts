import { Router } from "express";
import actividadesRoutes from "./actividadesRoutes";
import clientesRoutes from "./clientesRoutes";
import oportunidadesRoutes from "./oportunidadesRoutes";

const router = Router();

router.use("/clientes", clientesRoutes);
router.use("/oportunidades", oportunidadesRoutes);
router.use("/actividades", actividadesRoutes);

export default router;
