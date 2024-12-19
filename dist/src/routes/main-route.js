"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRouter = void 0;
const express_1 = require("express");
exports.MainRouter = (0, express_1.Router)();
exports.MainRouter.get('/', (req, res) => {
    res.send("Welcome to Klinik API");
});
