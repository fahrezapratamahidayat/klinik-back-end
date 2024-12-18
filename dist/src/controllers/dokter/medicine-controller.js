"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllMedicine = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllMedicine = async (req, res, next) => {
    try {
        const medicines = await prisma.medicine.findMany();
        if (medicines.length === 0) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Obat tidak ditemukan",
                data: [],
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Obat ditemukan",
            data: medicines,
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal server error",
            error: error.message,
            data: [],
        });
    }
};
exports.getAllMedicine = getAllMedicine;
