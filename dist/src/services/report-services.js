"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
class ReportController {
    async getPatientVisitReport(req, res, next) {
        try {
            const { from, to, all, page = 1, limit = 10, } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            let startDate;
            let endDate;
            if (from) {
                startDate = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(from));
                endDate = to ? (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(to)) : (0, date_fns_1.endOfDay)(startDate);
            }
            else if (all) {
                startDate = (0, date_fns_1.startOfDay)(new Date(2024, 0, 1));
                endDate = (0, date_fns_1.endOfDay)(new Date());
            }
            else {
                // Jika tidak ada parameter tanggal, gunakan hari ini
                startDate = (0, date_fns_1.startOfDay)(new Date());
                endDate = (0, date_fns_1.endOfDay)(new Date());
            }
            const totalData = await prisma_1.default.patientRegistration.count({
                where: {
                    registrationDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });
            const totalPages = Math.ceil(totalData / Number(limit));
            const visits = await prisma_1.default.patientRegistration.findMany({
                where: {
                    registrationDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    id: true,
                    registrationNumber: true,
                    registrationType: true,
                    registrationDate: true,
                    status: true,
                    patient: {
                        select: {
                            name: true,
                            gender: true,
                            address: {
                                select: {
                                    city: true,
                                },
                            },
                        },
                    },
                    doctor: {
                        select: {
                            name: true,
                            specialization: true,
                        },
                    },
                    room: {
                        select: {
                            name: true,
                            installation: true,
                        },
                    },
                    createdAt: true,
                    updatedAt: true,
                },
                skip,
                take: Number(limit),
                orderBy: {
                    registrationDate: "asc",
                },
            });
            if (visits.length === 0) {
                return res.status(404).json({
                    status: false,
                    statusCode: 404,
                    message: "data tidak ditemukan",
                    data: [],
                    pagination: {
                        totalItems: totalData,
                        totalPages,
                        page: Number(page),
                        limit: Number(limit),
                    },
                });
            }
            const summary = {
                totalVisit: visits.length,
                byRegistrationType: {
                    offline: visits.filter((v) => v.registrationType === "offline")
                        .length,
                    online: visits.filter((v) => v.registrationType === "online").length,
                },
                byStatus: {
                    draft: visits.filter((v) => v.status === "draft").length,
                    dalam_antrian: visits.filter((v) => v.status === "dalam_antrian")
                        .length,
                    selesai: visits.filter((v) => v.status === "selesai").length,
                    cancel: visits.filter((v) => v.status === "cancel").length,
                },
            };
            res.status(200).json({
                status: true,
                statusCode: 200,
                message: "Success",
                data: {
                    date: {
                        from: startDate,
                        to: endDate,
                    },
                    summary,
                    visits,
                },
                pagination: {
                    totalItems: totalData,
                    totalPages,
                    page: Number(page),
                    limit: Number(limit),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getIncomeReport(req, res, next) {
        try {
            const { from, to, all, page = 1, limit = 10 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            let startDate;
            let endDate;
            if (from) {
                startDate = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(from));
                endDate = to ? (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(to)) : (0, date_fns_1.endOfDay)(startDate);
            }
            else if (all) {
                startDate = (0, date_fns_1.startOfDay)(new Date(2024, 0, 1));
                endDate = (0, date_fns_1.endOfDay)(new Date());
            }
            else {
                startDate = (0, date_fns_1.startOfDay)(new Date());
                endDate = (0, date_fns_1.endOfDay)(new Date());
            }
            const totalData = await prisma_1.default.payment.count({
                where: {
                    paidAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                    paymentStatus: client_1.PaymentStatus.paid,
                },
            });
            const getIncome = await prisma_1.default.payment.findMany({
                where: {
                    paidAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                    paymentStatus: client_1.PaymentStatus.paid,
                },
                include: {
                    encounter: {
                        include: {
                            patientRegistration: {
                                include: {
                                    patient: {
                                        select: {
                                            name: true,
                                            medicalRecordNumber: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                skip,
                take: Number(limit),
                orderBy: {
                    createdAt: "desc",
                },
            });
            const transformedIncome = getIncome.map((payment) => ({
                id: payment.id,
                paymentNumber: payment.paymentNumber,
                paymentStatus: payment.paymentStatus,
                paymentUrl: payment.paymentUrl,
                patientName: payment.encounter.patientRegistration.patient.name,
                medicalRecordNumber: payment.encounter.patientRegistration.patient.medicalRecordNumber,
                payerName: payment.firstName + " " + payment.lastName,
                email: payment.email,
                phone: payment.phone,
                totalAmount: payment.totalAmount,
                paidAt: payment.paidAt,
                paidBy: payment.paidBy,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt,
            }));
            const totalIncome = transformedIncome.reduce((sum, payment) => sum + payment.totalAmount, 0);
            const totalPages = Math.ceil(totalData / Number(limit));
            res.status(200).json({
                status: true,
                statusCode: 200,
                message: "Success",
                data: {
                    date: {
                        from: startDate,
                        to: endDate,
                    },
                    totalIncome,
                    payments: transformedIncome,
                },
                pagination: {
                    totalItems: totalData,
                    totalPages,
                    page: Number(page),
                    limit: Number(limit),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTransactionHistory(req, res, next) {
        try {
            const { page = 1, limit = 10, search, startDate, endDate } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            // Buat filter dasar
            let whereClause = {};
            // Tambah filter pencarian jika ada
            if (search) {
                whereClause.OR = [
                    {
                        encounter: {
                            patientRegistration: {
                                patient: {
                                    name: {
                                        contains: search,
                                        mode: "insensitive",
                                    },
                                },
                            },
                        },
                    },
                    {
                        paymentNumber: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ];
            }
            // Tambah filter tanggal jika ada
            if (startDate && endDate) {
                whereClause.createdAt = {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                };
            }
            // Ambil total data
            const totalData = await prisma_1.default.payment.count({
                where: whereClause,
            });
            // Ambil data transaksi
            const transactions = await prisma_1.default.payment.findMany({
                where: whereClause,
                include: {
                    encounter: {
                        include: {
                            patientRegistration: {
                                include: {
                                    patient: {
                                        select: {
                                            name: true,
                                            medicalRecordNumber: true,
                                        },
                                    },
                                    doctor: {
                                        select: {
                                            name: true,
                                            specialization: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    paymentDetail: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: Number(limit),
            });
            const totalPages = Math.ceil(totalData / Number(limit));
            res.status(200).json({
                status: true,
                statusCode: 200,
                message: "Berhasil mengambil riwayat transaksi",
                data: {
                    transactions,
                    pagination: {
                        totalItems: totalData,
                        totalPages,
                        currentPage: Number(page),
                        itemsPerPage: Number(limit),
                    },
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ReportController();
