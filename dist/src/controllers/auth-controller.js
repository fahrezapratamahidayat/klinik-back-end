"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.login = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_validation_1 = require("../validations/auth-validation");
const prisma = new client_1.PrismaClient();
const login = async (req, res, next) => {
    try {
        const { email, password } = auth_validation_1.loginValidation.parse(req.body);
        if (!email || !password) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Email atau password tidak boleh kosong"
            });
        }
        // Cari user berdasarkan username
        const user = await prisma.account.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Email atau password salah'
            });
        }
        // Validasi password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Password salah'
            });
        }
        // Cek apakah user aktif
        if (!user.isActive) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Akun tidak aktif'
            });
        }
        // Update last login
        await prisma.account.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });
        // Generate token
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '7d' });
        // Generate refresh token
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        // Update refresh token di database
        await prisma.account.update({
            where: { id: user.id },
            data: { refreshToken }
        });
        res.json({
            status: true,
            statusCode: 200,
            message: 'Login berhasil',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role?.toLowerCase(),
                    accessToken: token,
                    refreshToken,
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Refresh token tidak boleh kosong"
            });
        }
        // Cari user berdasarkan refresh token
        const user = await prisma.account.findFirst({
            where: { refreshToken }
        });
        if (!user) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Refresh token tidak valid'
            });
        }
        // Verifikasi refresh token
        try {
            jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        }
        catch (error) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Refresh token expired'
            });
        }
        // Generate token baru
        const newAccessToken = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d' });
        // Generate refresh token baru
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        // Update refresh token di database
        await prisma.account.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken }
        });
        res.json({
            status: true,
            statusCode: 200,
            message: 'Refresh token berhasil',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
