"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorById = exports.getDoctors = exports.deleteDoctor = exports.updateDoctor = exports.createDoctor = void 0;
const client_1 = require("@prisma/client");
const doctor_validation_1 = require("../../validations/doctor-validation");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const createDoctor = async (req, res, next) => {
    try {
        const validatedData = doctor_validation_1.createDoctorValidation.parse(req.body);
        const { address, telecom, username, email, password, confirmPassword, ...doctorInfo } = validatedData;
        // validasi email sudah terdaftar
        const checkEmail = await prisma.account.findUnique({
            where: { email },
        });
        if (checkEmail) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Email sudah terdaftar",
            });
        }
        // Validasi password
        if (password !== confirmPassword) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Password tidak cocok",
            });
        }
        // hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const doctor = await prisma.doctor.create({
            data: {
                ...doctorInfo,
                birthDate: new Date(doctorInfo.birthDate),
                address: {
                    create: {
                        ...address,
                        extension: {
                            create: address.extension,
                        },
                    },
                },
                telecom: {
                    create: telecom.map((item) => ({
                        system: item.system,
                        use: item.use,
                        value: item.value,
                    })),
                },
                account: {
                    create: {
                        type: 'DOCTOR',
                        role: 'Dokter',
                        isActive: doctorInfo.status === "aktif",
                        username,
                        email,
                        password: hashedPassword,
                    },
                },
            },
            include: {
                address: {
                    include: {
                        extension: true,
                    },
                },
                telecom: true,
                account: true,
            },
        });
        res.status(201).json({
            status: true,
            statusCode: 201,
            message: "Dokter berhasil dibuat",
            data: {
                id: doctor.id,
                name: doctor.name,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createDoctor = createDoctor;
const updateDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = doctor_validation_1.updateDoctorValidation.parse(req.body);
        const { address, telecom, ...doctorInfo } = validatedData;
        const doctor = await prisma.doctor.update({
            where: { id },
            data: {
                ...doctorInfo,
                birthDate: doctorInfo.birthDate
                    ? new Date(doctorInfo.birthDate)
                    : undefined,
                address: address
                    ? {
                        update: {
                            ...address,
                            extension: address.extension
                                ? {
                                    update: address.extension,
                                }
                                : undefined,
                        },
                    }
                    : undefined,
                telecom: telecom
                    ? {
                        deleteMany: {},
                        create: telecom.map((item) => ({
                            system: item.system,
                            use: item.use,
                            value: item.value,
                        })),
                    }
                    : undefined,
            },
            include: {
                address: {
                    include: {
                        extension: true,
                    },
                },
                telecom: true,
            },
        });
        res.status(200).json({
            message: "Doctor updated successfully",
            data: doctor,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDoctor = updateDoctor;
const deleteDoctor = async (req, res, next) => {
    const { id } = req.params;
    try {
        const doctor = await prisma.doctor.delete({
            where: { id },
        });
        if (!doctor)
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Doctor not found",
            });
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Doctor deleted successfully",
            data: doctor,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDoctor = deleteDoctor;
const getDoctors = async (req, res, next) => {
    try {
        const page = req.query.page
            ? parseInt(req.query.page)
            : undefined;
        const limit = req.query.limit
            ? parseInt(req.query.limit)
            : undefined;
        let doctors;
        let totalCount;
        let meta = {};
        const selectFields = {
            id: true,
            name: true,
            specialization: true,
            consultationFee: true,
            status: true,
            birthDate: true,
            birthPlace: true,
            gender: true,
            address: {
                select: {
                    city: true,
                    postalCode: true,
                    country: true,
                },
            },
            telecom: {
                select: {
                    system: true,
                    use: true,
                    value: true,
                },
            },
            createdAt: true,
            updatedAt: true,
        };
        if (page !== undefined && limit !== undefined) {
            // Jika ada query paginasi
            const skip = (page - 1) * limit;
            [doctors, totalCount] = await Promise.all([
                prisma.doctor.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    select: selectFields,
                }),
                prisma.doctor.count(),
            ]);
            const totalPages = Math.ceil(totalCount / limit);
            meta = {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
            };
        }
        else {
            // Jika tidak ada query paginasi, ambil semua data
            doctors = await prisma.doctor.findMany({
                orderBy: { createdAt: "desc" },
                select: selectFields,
            });
            totalCount = doctors.length;
        }
        if (doctors.length === 0) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Tidak ada dokter yang ditemukan",
                data: []
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Dokter berhasil diambil",
            data: doctors,
            meta: Object.keys(meta).length > 0 ? meta : undefined,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDoctors = getDoctors;
const getDoctorById = async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            statusCode: 400,
            message: "parameter id tidak boleh kosong",
        });
    }
    try {
        const doctor = await prisma.doctor.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                specialization: true,
                status: true,
                bpjsCode: true,
                satuSehatId: true,
                createdAt: true,
                updatedAt: true,
                address: {
                    select: {
                        use: true,
                        line: true,
                        city: true,
                        country: true,
                        postalCode: true,
                        extension: {
                            select: {
                                rt: true,
                                rw: true,
                                province: {
                                    select: {
                                        name: true,
                                    },
                                },
                                district: {
                                    select: {
                                        name: true,
                                    },
                                },
                                subdistrict: {
                                    select: {
                                        name: true,
                                    },
                                },
                                village: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                telecom: {
                    select: {
                        id: true,
                        system: true,
                        use: true,
                        value: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
        if (!doctor) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Dokter tidak ditemukan",
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Data dokter berhasil diambil",
            data: doctor,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDoctorById = getDoctorById;
