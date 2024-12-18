"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedicine = exports.updateMedicine = exports.createMedicine = exports.getMedicineById = exports.getAllMedicine = void 0;
const client_1 = require("@prisma/client");
const medicine_validation_1 = require("../../validations/medicine-validation");
const generate_1 = require("../../utils/generate");
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
const getMedicineById = async (req, res, next) => {
    const { id } = req.params;
    try {
        if (!id) {
            res.status(400).json({
                status: false,
                statusCode: 400,
                message: "ID obat tidak ditemukan",
            });
        }
        const medicine = await prisma.medicine.findUnique({
            where: { id },
        });
        if (!medicine) {
            res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Obat tidak ditemukan",
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Obat ditemukan",
            data: medicine,
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal server error",
        });
    }
};
exports.getMedicineById = getMedicineById;
const createMedicine = async (req, res, next) => {
    const validate = medicine_validation_1.createMedicineValidation.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Validasi obat gagal",
            errors: validate.error.errors.map((error) => ({
                field: error.path.join('.'),
                message: error.message,
            })),
        });
    }
    try {
        const medicineCode = await (0, generate_1.generateMedicineCode)();
        const medicine = await prisma.medicine.create({
            data: {
                ...validate.data,
                code: medicineCode,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        res.status(201).json({
            status: true,
            statusCode: 201,
            message: "Obat berhasil ditambahkan",
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.createMedicine = createMedicine;
const updateMedicine = async (req, res, next) => {
    const validate = medicine_validation_1.updateMedicineValidation.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Validasi obat gagal",
            errors: validate.error.errors.map((error) => ({
                field: error.path.join('.'),
                message: error.message,
            })),
        });
    }
    try {
        const medicine = await prisma.medicine.update({
            where: { id: req.params.id },
            data: validate.data,
        });
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Obat berhasil diubah",
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.updateMedicine = updateMedicine;
const deleteMedicine = async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            statusCode: 400,
            message: "ID obat tidak ditemukan",
        });
    }
    try {
        const medicine = await prisma.medicine.delete({
            where: { id },
        });
        if (!medicine) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Obat tidak ditemukan",
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Obat berhasil dihapus",
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.deleteMedicine = deleteMedicine;
