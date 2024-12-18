"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: "Autentikasi tidak ditemukan"
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await prisma.account.findUnique({
            where: { id: decoded.id }
        });
        if (!user) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: "User tidak ditemukan"
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            status: false,
            statusCode: 401,
            message: "Token tidak valid"
        });
    }
};
exports.authenticate = authenticate;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                status: false,
                statusCode: 403,
                message: "Anda tidak memiliki akses ke resource ini"
            });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
