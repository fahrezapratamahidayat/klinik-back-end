"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../lib/prisma"));
class ServiceClassController {
    // Mendapatkan semua kelas layanan
    async getAll(req, res, next) {
        try {
            const serviceClasses = await prisma_1.default.serviceClass.findMany();
            res.status(200).json({
                status: true,
                statusCode: 200,
                message: "Data kelas layanan berhasil diambil",
                data: serviceClasses,
            });
        }
        catch (error) {
            res.status(500).json({
                status: false,
                statusCode: 500,
                message: "Terjadi kesalahan saat mengambil data kelas layanan",
                error,
            });
        }
    }
    // Mendapatkan kelas layanan berdasarkan ID
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const serviceClass = await prisma_1.default.serviceClass.findUnique({
                where: { id },
            });
            if (!serviceClass) {
                res.status(404).json({
                    status: false,
                    statusCode: 404,
                    message: "Kelas layanan tidak ditemukan",
                });
            }
            res.status(200).json({
                status: true,
                statusCode: 200,
                message: "Data kelas layanan berhasil diambil",
                data: serviceClass,
            });
        }
        catch (error) {
            res.status(500).json({
                status: false,
                statusCode: 500,
                message: "Terjadi kesalahan saat mengambil data kelas layanan",
                error,
            });
        }
    }
    // Membuat kelas layanan baru
    async create(req, res, next) {
        try {
            const { name, description, price } = req.body;
            const serviceClass = await prisma_1.default.serviceClass.create({
                data: {
                    name,
                    description,
                    price: parseFloat(price),
                },
            });
            res.status(201).json({
                status: true,
                statusCode: 201,
                message: "Data kelas layanan berhasil dibuat",
                data: serviceClass,
            });
        }
        catch (error) {
            res.status(500).json({
                status: false,
                statusCode: 500,
                message: "Terjadi kesalahan saat membuat kelas layanan",
                error,
            });
        }
    }
    // Memperbarui kelas layanan
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { name, description, price } = req.body;
            const serviceClass = await prisma_1.default.serviceClass.update({
                where: { id },
                data: {
                    name,
                    description,
                    price: parseFloat(price),
                },
            });
            res.status(200).json({
                status: true,
                statusCode: 200,
                message: "Data kelas layanan berhasil diperbarui",
                data: serviceClass,
            });
        }
        catch (error) {
            res.status(500).json({
                status: false,
                statusCode: 500,
                message: "Terjadi kesalahan saat memperbarui kelas layanan",
                error,
            });
        }
    }
    // Menghapus kelas layanan
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await prisma_1.default.serviceClass.delete({
                where: { id },
            });
            res.status(200).json({
                status: true,
                statusCode: 200,
                message: "Kelas layanan berhasil dihapus",
            });
        }
        catch (error) {
            res.status(500).json({
                status: false,
                statusCode: 500,
                message: "Terjadi kesalahan saat menghapus kelas layanan",
                error,
            });
        }
    }
}
exports.default = new ServiceClassController();
