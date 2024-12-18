"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth-controller");
exports.AuthRoutes = (0, express_1.Router)();
exports.AuthRoutes.post("/login", auth_controller_1.login);
exports.AuthRoutes.post("/refresh-token", auth_controller_1.refreshToken);
