"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePatient = exports.getPatientById = exports.getAllPatients = exports.createNewbornPatient = exports.createPatient = void 0;
const client_1 = require("@prisma/client");
const generate_1 = require("../../utils/generate");
const validation_1 = require("../../helpers/validation");
const patient_validation_1 = require("../../validations/patient-validation");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
const createPatient = async (req, res) => {
    try {
        const { identifierType, identifier, name, birthDate, birthPlace, gender, nomorKartuKeluarga, address, telecom, maritalStatus, citizenshipStatus, multipleBirthInteger, bloodType, education, religion, responsiblePersonName, responsiblePersonRelation, responsiblePersonPhone, } = req.body;
        if (!(0, validation_1.validateInput)(patient_validation_1.createPatientValidation, req, res))
            return;
        // Validasi data berdasarkan jenis pasien
        if (identifierType === client_1.IdentifierType.tanpa_nik) {
            if (name.length < 3 || !birthDate || !gender) {
                return res
                    .status(400)
                    .json({
                    status: false,
                    statusCode: 400,
                    message: "Data tidak lengkap untuk pasien tanpa NIK",
                });
            }
        }
        else if (identifierType === client_1.IdentifierType.nik) {
            if (!identifier || identifier.length !== 16) {
                return res
                    .status(400)
                    .json({ status: false, statusCode: 400, message: "NIK tidak valid" });
            }
        }
        else {
            return res
                .status(400)
                .json({
                status: false,
                statusCode: 400,
                message: "Tipe identifier tidak valid",
            });
        }
        // Check if identifier already exists (hanya untuk pasien dengan NIK)
        if (identifierType === client_1.IdentifierType.nik) {
            const existingPatient = await prisma.patient.findFirst({
                where: { identifier: identifier },
            });
            if (existingPatient) {
                return res
                    .status(400)
                    .json({
                    status: false,
                    statusCode: 400,
                    message: "Pasien dengan NIK tersebut sudah ada",
                });
            }
        }
        const medicalRecordNumber = await (0, generate_1.generateMedicalRecordNumber)();
        const newPatient = await prisma.patient.create({
            data: {
                medicalRecordNumber,
                identifierType,
                identifier,
                name,
                birthDate: new Date(birthDate),
                birthPlace,
                gender,
                nomorKartuKeluarga,
                maritalStatus,
                citizenshipStatus,
                multipleBirthInteger,
                responsiblePersonName,
                responsiblePersonRelation,
                responsiblePersonPhone,
                bloodType,
                education,
                religion,
                address: {
                    create: {
                        use: address.use,
                        line: address.line,
                        city: address.city,
                        postalCode: address.postalCode,
                        country: address.country,
                        extension: {
                            create: {
                                provinceCode: address.extension.provinceCode,
                                districtCode: address.extension.districtCode,
                                subdistrictCode: address.extension.subdistrictCode,
                                villageCode: address.extension.villageCode,
                                rt: address.extension.rt,
                                rw: address.extension.rw,
                            },
                        },
                    },
                },
                telecom: {
                    create: telecom,
                },
            },
            include: {
                address: {
                    include: {
                        extension: true,
                    },
                },
                telecom: true,
                relatedPersons: true,
            },
        });
        res.status(201).json({
            status: true,
            statusCode: 201,
            message: "Pasien berhasil dibuat",
            data: {
                id: newPatient.id,
            },
        });
    }
    catch (error) {
        console.error("Kesalahan saat membuat pasien:", error);
        res
            .status(500)
            .json({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan saat membuat pasien",
        });
    }
};
exports.createPatient = createPatient;
const createNewbornPatient = async (req, res) => {
    try {
        const { name, birthDate, birthPlace, gender, multipleBirthInteger, motherNIK, address, telecom, nomorKartuKeluarga, responsiblePersonName, responsiblePersonRelation, responsiblePersonPhone, } = req.body;
        if (!(0, validation_1.validateInput)(patient_validation_1.createNewbornPatientValidation, req, res))
            return;
        // Cari data ibu
        const mother = await prisma.patient.findFirst({
            where: { identifier: motherNIK },
        });
        if (!mother) {
            return res.status(400).json({ message: "Data ibu tidak ditemukan" });
        }
        if (mother.gender === client_1.Gender.male) {
            return res.json({
                message: "NIK bukan seorang ibu atau wanita",
            });
        }
        const medicalRecordNumber = await (0, generate_1.generateMedicalRecordNumber)();
        const newNewbornPatient = await prisma.patient.create({
            data: {
                medicalRecordNumber,
                identifierType: client_1.IdentifierType.nik_ibu,
                identifier: motherNIK,
                nomorKartuKeluarga: mother.nomorKartuKeluarga || nomorKartuKeluarga,
                name,
                birthDate: new Date(birthDate),
                birthPlace,
                gender,
                multipleBirthInteger,
                responsiblePersonName,
                responsiblePersonRelation,
                responsiblePersonPhone,
                citizenshipStatus: client_1.CitizenshipStatus.wni,
                address: {
                    create: {
                        use: address.use,
                        line: address.line,
                        city: address.city,
                        postalCode: address.postalCode,
                        country: address.country,
                        extension: {
                            create: {
                                provinceCode: address.extension.provinceCode,
                                districtCode: address.extension.districtCode,
                                subdistrictCode: address.extension.subdistrictCode,
                                villageCode: address.extension.villageCode,
                                rt: address.extension.rt,
                                rw: address.extension.rw,
                            },
                        },
                    },
                },
                telecom: {
                    create: telecom,
                },
                relatedPersons: {
                    create: {
                        relationType: "MTH",
                        name: mother.name,
                        gender: mother.gender,
                        birthDate: mother.birthDate,
                        address: {
                            connect: { id: mother.addressId },
                        },
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
                relatedPersons: true,
            },
        });
        res.status(201).json({
            message: "Pasien bayi baru lahir berhasil dibuat",
            data: newNewbornPatient,
        });
    }
    catch (error) {
        console.error("Kesalahan saat membuat pasien bayi baru lahir:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat membuat pasien bayi baru lahir",
        });
    }
};
exports.createNewbornPatient = createNewbornPatient;
const getAllPatients = async (req, res, next) => {
    try {
        const { from, to, all, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        let startDate;
        let endDate;
        if (from) {
            startDate = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(from));
            endDate = to ? (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(to)) : (0, date_fns_1.endOfDay)(new Date());
        }
        else if (all) {
            startDate = (0, date_fns_1.startOfDay)(new Date(2024, 0, 1));
            endDate = (0, date_fns_1.endOfDay)(new Date());
        }
        else {
            startDate = new Date(0);
            endDate = new Date();
        }
        const totalData = await prisma.patient.count({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });
        const totalPages = Math.ceil(totalData / Number(limit));
        const patients = await prisma.patient.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                id: true,
                medicalRecordNumber: true,
                identifier: false,
                identifierType: true,
                name: true,
                birthDate: true,
                birthPlace: true,
                gender: true,
                address: {
                    select: {
                        use: true,
                        line: true,
                        city: true,
                        postalCode: true,
                        country: true,
                        extension: {
                            select: {
                                provinceCode: false,
                                districtCode: false,
                                subdistrictCode: false,
                                villageCode: false,
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
                                rt: true,
                                rw: true,
                            },
                        },
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
            skip,
            take: Number(limit),
            orderBy: [{ createdAt: "asc" }],
        });
        if (patients.length === 0) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Tidak ada pasien yang ditemukan",
                data: [],
                pagination: {
                    totalItems: totalData,
                    totalPages,
                    page: Number(page),
                    limit: Number(limit),
                },
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Daftar semua pasien berhasil diambil",
            data: patients,
            pagination: {
                totalItems: totalData,
                totalPages,
                page: Number(page),
                limit: Number(limit),
            },
        });
    }
    catch (error) {
        console.error("Kesalahan saat mengambil daftar pasien:", error);
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan saat mengambil daftar pasien",
        });
    }
};
exports.getAllPatients = getAllPatients;
const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                address: {
                    include: {
                        extension: {
                            select: {
                                rt: true,
                                rw: true,
                                province: {
                                    select: {
                                        code: true,
                                        name: true,
                                    },
                                },
                                district: {
                                    select: {
                                        code: true,
                                        name: true,
                                    },
                                },
                                subdistrict: {
                                    select: {
                                        code: true,
                                        name: true,
                                    },
                                },
                                village: {
                                    select: {
                                        code: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                telecom: true,
                relatedPersons: true,
            },
        });
        if (!patient) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Pasien tidak ditemukan",
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Data pasien ditemukan",
            data: patient,
        });
    }
    catch (error) {
        console.error("Kesalahan saat mencari pasien:", error);
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan saat mencari pasien",
        });
    }
};
exports.getPatientById = getPatientById;
const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.patient.delete({ where: { id } });
        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Pasien berhasil dihapus",
        });
    }
    catch (error) {
        console.error("Kesalahan saat menghapus pasien:", error);
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan saat menghapus pasien",
            errors: error.message,
        });
    }
};
exports.deletePatient = deletePatient;
