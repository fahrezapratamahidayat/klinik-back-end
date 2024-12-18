"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueueInfo = exports.updatePatientRegistrationStatus = exports.deletePatientRegistration = exports.getPatientRegistrationById = exports.getPatientRegistrations = exports.createPatientRegistration = void 0;
const patient_validation_1 = require("../../validations/patient-validation");
const generate_1 = require("../../utils/generate");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const createPatientRegistration = async (req, res) => {
    try {
        const { patientId, doctorId, roomId, scheduleId, isOnline, encounterType } = patient_validation_1.createPatientRegistrationValidation.parse(req.body);
        const [patient, doctor] = await Promise.all([
            prisma_1.default.patient.findUnique({ where: { id: patientId } }),
            prisma_1.default.doctor.findUnique({ where: { id: doctorId } }),
        ]);
        if (!patient)
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Pasien tidak ditemukan",
            });
        if (!doctor)
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Dokter tidak ditemukan",
            });
        // Periksa jadwal dokter
        const doctorSchedule = await prisma_1.default.doctorSchedule.findUnique({
            where: { id: scheduleId },
        });
        if (!doctorSchedule || !doctorSchedule.isActive) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Jadwal dokter tidak tersedia",
            });
        }
        // Validasi jadwal dokter untuk hari ini
        const today = new Date();
        const currentTime = today.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
        });
        if (doctorSchedule.date.toDateString() !== today.toDateString()) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Jadwal dokter tidak tersedia untuk hari ini",
            });
        }
        // Validasi waktu pendaftaran
        if (currentTime < doctorSchedule.startTime ||
            currentTime > doctorSchedule.endTime) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Waktu pendaftaran di luar jadwal praktik dokter",
            });
        }
        // Periksa kuota yang tersedia
        const availableQuota = isOnline
            ? doctorSchedule.remainingOnlineQuota
            : doctorSchedule.remainingOfflineQuota;
        if (availableQuota <= 0) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: `Kuota ${isOnline ? "online" : "offline"} untuk jadwal ini telah habis`,
            });
        }
        const queueNumber = await (0, generate_1.generateDailyQueueNumber)(doctorId);
        const formattedDate = (0, date_fns_1.format)(new Date(), "dd MMMM yyyy", { locale: locale_1.id });
        // Buat registrasi pasien
        const registrationNumber = await (0, generate_1.generateRegistrationId)();
        const patientRegistration = await prisma_1.default.patientRegistration.create({
            data: {
                patientId,
                doctorId,
                roomId,
                registrationNumber,
                registrationDate: new Date(),
                queueNumber,
            },
        });
        // Create Encounter
        const encounter = await prisma_1.default.encounter.create({
            data: {
                patientRegistrationId: patientRegistration.id,
                encounterType,
                status: "planned",
                startDate: new Date(),
            },
        });
        // Update kuota yang tersisa
        await prisma_1.default.doctorSchedule.update({
            where: { id: scheduleId },
            data: {
                remainingOnlineQuota: isOnline
                    ? doctorSchedule.remainingOnlineQuota - 1
                    : doctorSchedule.remainingOnlineQuota,
                remainingOfflineQuota: !isOnline
                    ? doctorSchedule.remainingOfflineQuota - 1
                    : doctorSchedule.remainingOfflineQuota,
            },
        });
        await prisma_1.default.encounterTimeline.create({
            data: {
                encounterId: encounter.id,
                status: "draft",
                timestamp: new Date(),
                performedBy: "Pendaftaran",
                createdAt: new Date(),
            },
        });
        res.status(201).json({
            status: true,
            statusCode: 201,
            message: "Registrasi pasien berhasil dibuat",
            data: patientRegistration,
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Terjadi kesalahan server internal",
        });
    }
};
exports.createPatientRegistration = createPatientRegistration;
const getPatientRegistrations = async (req, res, next) => {
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
            // Jika tidak ada parameter tanggal, gunakan hari ini
            startDate = (0, date_fns_1.startOfDay)(new Date());
            endDate = (0, date_fns_1.endOfDay)(new Date());
        }
        // ambil total data
        const totalData = await prisma_1.default.patientRegistration.count({
            where: {
                registrationDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: { in: ["draft", "dalam_antrian"] },
            },
        });
        const totalPages = Math.ceil(totalData / Number(limit));
        const patientRegistrations = await prisma_1.default.patientRegistration.findMany({
            where: {
                registrationDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: { in: ["draft", "dalam_antrian"] },
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
            skip,
            take: Number(limit),
            orderBy: [{ registrationDate: "desc" }, { queueNumber: "asc" }],
        });
        if (patientRegistrations.length === 0) {
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
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Pendaftaran pasien ditemukan",
            data: patientRegistrations,
            pagination: {
                totalItems: totalData,
                totalPages,
                page: Number(page),
                limit: Number(limit),
            },
        });
    }
    catch (error) {
        next();
    }
};
exports.getPatientRegistrations = getPatientRegistrations;
const getPatientRegistrationById = async (req, res) => {
    const { id } = req.params;
    try {
        const patientRegistration = await prisma_1.default.patientRegistration.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                registrationNumber: true,
                registrationDate: true,
                queueNumber: true,
                status: true,
                registrationType: true,
                patient: {
                    select: {
                        id: true,
                        name: true,
                        medicalRecordNumber: true,
                        identifierType: true,
                        gender: true,
                        birthPlace: true,
                        birthDate: true,
                        bloodType: true,
                        maritalStatus: true,
                        religion: true,
                        telecom: true,
                        address: {
                            select: {
                                id: true,
                                use: true,
                                line: true,
                                city: true,
                                postalCode: true,
                                country: true,
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
        if (!patientRegistration)
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Patient registration not found",
                data: null,
                total: 0,
            });
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Patient registration found",
            data: patientRegistration,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPatientRegistrationById = getPatientRegistrationById;
const deletePatientRegistration = async (req, res) => {
    const { id } = req.params;
    try {
        const registration = await prisma_1.default.patientRegistration.findUnique({
            where: { id },
            include: {
                doctor: {
                    include: {
                        doctorSchedule: {
                            where: {
                                date: {
                                    gte: (0, date_fns_1.startOfDay)(new Date()),
                                    lte: (0, date_fns_1.endOfDay)(new Date()),
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!registration) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Registrasi pasien tidak ditemukan",
            });
        }
        const deletedRegistration = await prisma_1.default.patientRegistration.delete({
            where: { id },
        });
        if (registration.doctor.doctorSchedule.length > 0) {
            const schedule = registration.doctor.doctorSchedule[0];
            const isOnline = registration.registrationType === "online";
            await prisma_1.default.doctorSchedule.update({
                where: { id: schedule.id },
                data: {
                    remainingOnlineQuota: isOnline ? { increment: 1 } : undefined,
                    remainingOfflineQuota: !isOnline ? { increment: 1 } : undefined,
                },
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Registrasi pasien berhasil dihapus dan slot jadwal dikembalikan",
            data: deletedRegistration,
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
exports.deletePatientRegistration = deletePatientRegistration;
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
        const result = await prisma_1.default.$transaction(async (prisma) => {
            const updatedRegistration = await prisma.patientRegistration.update({
                where: { id },
                data: { status: validateData.data.status },
            });
            if (!updatedRegistration) {
                throw new Error("Registrasi pasien tidak ditemukan");
            }
            const encounter = await prisma.encounter.findFirst({
                where: { patientRegistrationId: id },
            });
            if (!encounter) {
                throw new Error("Encounter tidak ditemukan untuk registrasi ini");
            }
            await prisma.encounter.update({
                where: { id: encounter.id },
                data: {
                    status: validateData.data.statusEncounter,
                },
            });
            await prisma.encounterTimeline.create({
                data: {
                    encounterId: encounter.id,
                    status: validateData.data.status,
                    timestamp: new Date(),
                    performedBy: "Pendaftaran",
                    createdAt: new Date(),
                },
            });
            return updatedRegistration;
        });
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: `Status registrasi pasien berhasil diperbarui menjadi ${validateData.data.status.replace("_", " ").charAt(0).toUpperCase() +
                validateData.data.status.replace("_", " ").slice(1)}`,
            data: result,
        });
    }
    catch (error) {
        if (error.message === "Registrasi pasien tidak ditemukan" ||
            error.message === "Encounter tidak ditemukan untuk registrasi ini") {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: error.message,
            });
        }
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
            // Jika tidak ada parameter tanggal, gunakan hari ini
            startDate = (0, date_fns_1.startOfDay)(new Date());
            endDate = (0, date_fns_1.endOfDay)(new Date());
        }
        const todayRegistrations = await prisma_1.default.patientRegistration.findMany({
            where: {
                registrationDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    in: ["draft"],
                },
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
