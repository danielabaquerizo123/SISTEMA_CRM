"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("./middlewares/errorHandler");
const routes_1 = __importDefault(require("./routes"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({ origin: "http://localhost:5173" }));
exports.app.use(express_1.default.json());
exports.app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
exports.app.use("/api", routes_1.default);
exports.app.use(errorHandler_1.errorHandler);
