"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const actividadesRoutes_1 = __importDefault(require("./actividadesRoutes"));
const clientesRoutes_1 = __importDefault(require("./clientesRoutes"));
const oportunidadesRoutes_1 = __importDefault(require("./oportunidadesRoutes"));
const router = (0, express_1.Router)();
router.use("/clientes", clientesRoutes_1.default);
router.use("/oportunidades", oportunidadesRoutes_1.default);
router.use("/actividades", actividadesRoutes_1.default);
exports.default = router;
