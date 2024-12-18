"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueueInfo = exports.updatePatientRegistrationStatus = exports.getPatientRegistrationById = exports.getPatientRegistration = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const patient_validation_1 = require("../../validations/patient-validation");
const prisma = new client_1.PrismaClient();
const getPatientRegistration = async (req, res) => {
    try {
        const { from, to } = req.query;
        let startDate;
        let endDate;
        if (from) {
            startDate = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(from));
            endDate = to ? (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(to)) : (0, date_fns_1.endOfDay)(new Date());
        }
        else {
            startDate = new Date(0);
            endDate = new Date();
        }
        const patientRegistration = await prisma.patientRegistration.findMany({
            where: {
                status: { in: ["antrian_dokter", "dalam_pemeriksaan_dokter"] },
                registrationDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                id: true,
                registrationNumber: true,
                registrationDate: true,
                queueNumber: true,
                status: true,
                patient: {
                    select: {
                        id: true,
                        name: true,
                        medicalRecordNumber: true,
                        gender: true,
                        birthDate: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                    },
                },
                room: {
                    select: {
                        id: true,
                        name: true,
                        installation: true,
                    },
                },
                encounter: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });
        if (patientRegistration.length === 0) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Data tidak ditemukan",
                data: [],
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Berhasil mengambil data pasien dalam antrian",
            data: patientRegistration,
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Gagal mengambil data pasien dalam antrian",
            data: [],
            error: error,
        });
    }
};
exports.getPatientRegistration = getPatientRegistration;
const getPatientRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "ID pasien dalam antrian tidak ditemukan",
            });
        }
        const patientRegistration = await prisma.patientRegistration.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                registrationNumber: true,
                registrationDate: true,
                status: true,
                registrationType: true,
                patient: {
                    select: {
                        id: true,
                        identifierType: true,
                        medicalRecordNumber: true,
                        name: true,
                        gender: true,
                        birthDate: true,
                        birthPlace: true,
                        maritalStatus: true,
                        bloodType: true,
                        education: true,
                        citizenshipStatus: true,
                        religion: true,
                        responsiblePersonName: true,
                        responsiblePersonPhone: true,
                        telecom: true,
                        address: {
                            select: {
                                id: true,
                                use: true,
                                line: true,
                                city: true,
                                postalCode: true,
                                extension: {
                                    select: {
                                        id: true,
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
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                    },
                },
                room: {
                    select: {
                        id: true,
                        name: true,
                        installation: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!patientRegistration) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Data pasien dalam antrian tidak ditemukan",
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Berhasil mengambil data pasien dalam antrian",
            data: patientRegistration,
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Gagal mengambil data pasien dalam antrian",
            error: error,
        });
    }
};
exports.getPatientRegistrationById = getPatientRegistrationById;
const updatePatientRegistrationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "ID registrasi pasien tidak valid",
            });
        }
        const validateData = patient_validation_1.patientRegistrationStatusSchema.safeParse(req.body);
        if (!validateData.success) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Data tidak valid",
                errors: validateData.error.errors.map((error) => ({
                    path: error.path.join("."),
                    message: error.message,
                })),
            });
        }
        const updatedRegistration = await prisma.patientRegistration.update({
            where: { id },
            data: { status: validateData.data.status },
        });
        if (!updatedRegistration) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Registrasi pasien tidak ditemukan",
            });
        }
        const encounter = await prisma.encounter.findFirst({
            where: { patientRegistrationId: id },
        });
        if (!encounter) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Encounter tidak ditemukan untuk registrasi ini",
            });
        }
        await prisma.encounter.update({
            where: { id: encounter.id },
            data: { status: validateData.data.statusEncounter },
        });
        await prisma.encounterTimeline.create({
            data: {
                encounterId: encounter.id,
                status: validateData.data.status,
                timestamp: new Date(),
                performedBy: validateData.data.performedBy || "Perawat",
                notes: validateData.data.notes || "",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: `Status registrasi pasien berhasil diperbarui menjadi ${validateData.data.status.replace("_", " ").charAt(0).toUpperCase() +
                validateData.data.status.replace("_", " ").slice(1)}`,
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan server internal",
            error: error.message,
        });
    }
};
exports.updatePatientRegistrationStatus = updatePatientRegistrationStatus;
const getQueueInfo = async (req, res) => {
    try {
        const { from, to } = req.query;
        let startDate;
        let endDate;
        if (from) {
            startDate = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(from));
            endDate = to ? (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(to)) : (0, date_fns_1.endOfDay)(startDate);
        }
        else {
            startDate = (0, date_fns_1.startOfDay)(new Date());
            endDate = (0, date_fns_1.endOfDay)(new Date());
        }
        const todayRegistrations = await prisma.patientRegistration.findMany({
            where: {
                registrationDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: "antrian_dokter",
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        medicalRecordNumber: true,
                        gender: true,
                        birthDate: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                    },
                },
                room: {
                    select: {
                        id: true,
                        name: true,
                        installation: true,
                    },
                },
                encounter: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                queueNumber: "asc",
            },
        });
        if (todayRegistrations.length === 0) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Tidak ada pendaftaran pasien untuk hari ini",
                data: [],
                meta: {
                    totalQueue: 0,
                    currentQueue: 0,
                    nextQueue: 0,
                    previousQueue: 0,
                    remainingQueue: 0,
                },
            });
        }
        const totalQueue = todayRegistrations.length;
        const currentQueue = todayRegistrations.find((reg) => reg.status === "dalam_antrian")
            ?.queueNumber || 0;
        const nextQueue = todayRegistrations.find((reg) => reg.status === "draft" && reg.queueNumber > currentQueue)?.queueNumber || 0;
        const previousQueue = currentQueue > 1 ? currentQueue - 1 : 0;
        const formattedRegistrations = todayRegistrations.map((reg) => ({
            id: reg.id,
            registrationNumber: reg.registrationNumber,
            registrationDate: (0, date_fns_1.format)(reg.registrationDate, "dd MMMM yyyy HH:mm", {
                locale: locale_1.id,
            }),
            queueNumber: reg.queueNumber,
            status: reg.status,
            patient: {
                ...reg.patient,
                birthDate: (0, date_fns_1.format)(reg.patient.birthDate, "dd MMMM yyyy", {
                    locale: locale_1.id,
                }),
            },
            doctor: reg.doctor,
            room: reg.room,
            encounter: reg.encounter,
        }));
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Informasi antrian hari ini berhasil diambil",
            data: formattedRegistrations,
            meta: {
                totalQueue,
                currentQueue,
                nextQueue,
                previousQueue,
                remainingQueue: totalQueue - currentQueue,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan server internal",
            error: error.message,
            data: [],
            meta: {},
        });
    }
};
exports.getQueueInfo = getQueueInfo;
